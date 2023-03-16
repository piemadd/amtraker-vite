import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import stringToHash from "../../components/money/stringToHash";
import { stationMeta } from "../../data/stations.js";
import Banner from "../../components/money/terraBanner";

import "./trains.css";
import SettingsInit from "../index/settingsInit";

const fullDirections = {
  N: "North",
  S: "South",
  E: "East",
  W: "West",
  NE: "Northeast",
  NW: "Northwest",
  SE: "Southeast",
  SW: "Southwest",
};

const hoursAndMinutesUnitl = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.max(then - now, 0);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60 / 60 - hours) * 60);
  // creating the text
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;
  if (hours === 0) amount = `${Math.abs(minutes)}m`;

  return amount;
};

const toHoursAndMinutesLate = (date1, date2) => {
  if (
    date1.toString() === "Invalid Date" ||
    date2.toString() === "Invalid Date"
  )
    return "Unknown (Estimate Error)";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Unknown (Schedule Error)";

  const hours = Math.floor(Math.abs(diff) / 1000 / 60 / 60);
  const minutes = Math.floor((Math.abs(diff) / 1000 / 60 / 60 - hours) * 60);

  // creating the text
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  if (hours === 0) amount = `${Math.abs(minutes)}m`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;

  //on time
  if (diff === 0) return "On Time";

  //late or early
  return diff > 0 ? `${amount} late` : `${amount} early`;
};

const colorizedToHoursAndMinutesLate = (date1, date2) => {
  const res = toHoursAndMinutesLate(date1, date2);

  if (res === "Estimate Error") return <span className='late-text'>{res}</span>;
  if (res === "Schedule Error") return <span className='late-text'>{res}</span>;
  if (res === "On Time") return <span className='on-time-text'>{res}</span>;
  if (res.includes("late")) return <span className='late-text'>{res}</span>;
  if (res.includes("early")) return <span className='early-text'>{res}</span>;

  return <span className='error'>{res}</span>;
};

const calculateDistanceBetweenCoordinates = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
};

const presetExponential = (x) => {
  const result = Math.min(x * x, 1);
  //console.log(result)
  return result;
};

const calculateTimeTilLocation = (train, station, location) => {
  const distanceBetweenTrainAndStation = calculateDistanceBetweenCoordinates(
    train.lat,
    train.lon,
    stationMeta[station.code].lat,
    stationMeta[station.code].lon
  );

  //takes distance between train and location and adjusts it along
  //a curve to increase the chances to be early rather than late

  const distanceBetweenTrainAndLocation =
    presetExponential(
      calculateDistanceBetweenCoordinates(
        train.lat,
        train.lon,
        location[0],
        location[1]
      ) / distanceBetweenTrainAndStation
    ) * distanceBetweenTrainAndStation;

  const unadjustedDistanceBetweenStationAndLocation =
    calculateDistanceBetweenCoordinates(
      train.lat,
      train.lon,
      location[0],
      location[1]
    );

  //in ms
  const timeUntilTrainAtStation =
    new Date(station.arr).valueOf() - new Date(train.lastValTS).valueOf();

  const averageVelocity =
    distanceBetweenTrainAndStation / timeUntilTrainAtStation;
  const timeUntilTrainAtLocation =
    distanceBetweenTrainAndLocation / averageVelocity;

  //console.log('distanceBetweenTrainAndLocation', distanceBetweenTrainAndLocation)
  //console.log('distanceBetweenTrainAndStation', distanceBetweenTrainAndStation)
  //console.log('timeUntilTrainAtStation', timeUntilTrainAtStation)

  if (distanceBetweenTrainAndLocation > distanceBetweenTrainAndStation) {
    return "Train has already passed or you are along the wrong tracks";
  }

  //if further away than ~50 miles, return an "error"
  if (unadjustedDistanceBetweenStationAndLocation > 80467) {
    return "Too far away to give estimate, try again when within ~50mi.";
  }

  return hoursAndMinutesUnitl(new Date().valueOf() + timeUntilTrainAtLocation);
};

const BetterTrainPage = () => {
  const { trainNum, trainDate } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [foamerMode, setFoamerMode] = useState(false);
  const [navigatorExists, setNavigatorExists] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userLocation, setUserLocation] = useState([null, null]);

  useEffect(() => {
    console.log("sending request");
    fetch(`https://api-v3.amtraker.com/v3/trains/${trainNum}-${trainDate}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data fetched", data);
        setLoading(false);
        if (Array.isArray(data) && Object.keys(data).length === 0) {
          console.log("is not valid");
        } else {
          console.log("is valid");
          setTrainData(data[trainNum]);

          // setting saved train
          if (!localStorage.getItem("savedTrainsAmtrakerV3")) {
            localStorage.setItem("savedTrainsAmtrakerV3", "");
          }

          const savedTrains = localStorage
            .getItem("savedTrainsAmtrakerV3")
            .split(",")
            .filter((n) => n);

          const savedTrain = savedTrains.find((element) => {
            return (
              element.split("-")[0] === trainNum &&
              element.split("-")[2] === trainDate
            );
          });

          if (savedTrain === undefined) {
            const departureDate = new Date(data[trainNum][0].stations[0].dep);
            localStorage.setItem(
              "savedTrainsAmtrakerV3",
              [
                ...savedTrains,
                `${trainNum}-${
                  departureDate.getMonth() + 1
                }-${trainDate}-${departureDate
                  .getFullYear()
                  .toString()
                  .substring(2, 4)}`,
              ].join(",")
            );
          }
        }
      });
  }, [trainNum, trainDate]);

  useEffect(() => {
    let settings = JSON.parse(localStorage.getItem("amtraker-v3-settings"));
    if (settings) {
      if (settings.foamerMode) {
        setFoamerMode(settings.foamerMode);
      } else {
        setFoamerMode(false);
        settings.foamerMode = false;
      }
      localStorage.setItem("amtraker-v3-settings", JSON.stringify(settings));
    } //else is handled by the settings init
  }, []);

  useEffect(() => {
    if (foamerMode == false || !("geolocation" in navigator)) {
      console.log("no geolocation");
    } else {
      setNavigatorExists(true);
      navigator.geolocation.getCurrentPosition((res) => {
        setLoadingLocation(false);
        setUserLocation([res.coords.latitude, res.coords.longitude]);
      });
    }
  }, [foamerMode]);

  const originStation = trainData[0]
    ? trainData[0].stations.find((station) => {
        return station.code === trainData[0].origCode;
      })
    : null;

  const destinationStation = trainData[0]
    ? trainData[0].stations.find((station) => {
        return station.code === trainData[0].destCode;
      })
    : null;

  const currentStation = trainData[0]
    ? trainData[0].stations.find((station) => {
        return station.code === trainData[0].eventCode;
      })
    : null;

  const [bgURL, setBGURL] = useState("/content/images/amtraker-bg.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
          "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
        hash ==
          "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });
  }, []);

  return (
    <>
      <img
        id='background'
        alt='Amtrak network map.'
        className={bgClass}
        src={bgURL}
      ></img>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
            }}
            className='click'
          >
            Back
          </h2>
          {navigator.share ? (
            <h2
              onClick={() => {
                navigator.share({
                  title: `Track the Amtrak ${trainData[0].routeName} Train with Amtraker!`,
                  url: `https://amtraker.com/trains/${trainData[0].trainID
                    .split("-")
                    .join("/")}`,
                });
              }}
              className='click'
            >
              Share Train
            </h2>
          ) : null}
        </div>
        <section className='section-trainPage'>
          <SettingsInit />
          {!loading ? (
            <>
              {trainData.length > 0 ? (
                <>
                  <h1>
                    {trainData[0].routeName} (Train {trainData[0].trainNum})
                  </h1>
                  <p
                    className='click'
                    style={{ textDecoration: "underline", marginTop: "-6px" }}
                    onClick={() => {
                      // removing saved train
                      const savedTrains = localStorage
                        .getItem("savedTrainsAmtrakerV3")
                        .split(",")
                        .filter((n) => n);

                      localStorage.setItem(
                        "savedTrainsAmtrakerV3",
                        savedTrains
                          .filter((element) => {
                            if (
                              element.split("-")[0] === trainNum &&
                              element.split("-")[2] === trainDate
                            ) {
                              return false;
                            }

                            return true;
                          })
                          .join(",")
                      );

                      if (history.state.idx && history.state.idx > 0) {
                        navigate(-1);
                      } else {
                        navigate("/", { replace: true }); //fallback
                      }
                    }}
                  >
                    Delete Train
                  </p>
                  {new Date(trainData[0].lastValTS).valueOf() <
                  new Date().valueOf() - 1000 * 60 * 15 ? (
                    <p className='staleTrainWarning'>
                      WARNING: THIS TRAIN'S DATA IS STALE! Data feed has not
                      been updated since{" "}
                      {new Intl.DateTimeFormat([], {
                        hour: "numeric",
                        minute: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZoneName: "short",
                      }).format(new Date(trainData[0].lastValTS))}
                    </p>
                  ) : null}
                  <h2>Train Info:</h2>
                  <ul>
                    <li>
                      <i>Origin: </i>
                      <Link to={`/stations/${trainData[0].origCode}`}>
                        {trainData[0].origName} ({trainData[0].origCode})
                      </Link>
                      <ul>
                        <li>
                          Left{" "}
                          {toHoursAndMinutesLate(
                            new Date(originStation.dep ?? null),
                            new Date(originStation.schDep ?? null)
                          )}{" "}
                          (
                          {new Intl.DateTimeFormat([], {
                            hour: "numeric",
                            minute: "numeric",
                            timeZone: originStation.tz,
                          }).format(new Date(originStation.dep ?? null))}
                          )
                        </li>
                      </ul>
                    </li>
                    <li>
                      <i>Destination: </i>
                      <Link to={`/stations/${trainData[0].destCode}`}>
                        {trainData[0].destName} ({trainData[0].destCode})
                      </Link>
                      <ul>
                        <li>
                          Estimated to be{" "}
                          {toHoursAndMinutesLate(
                            new Date(destinationStation.arr ?? null),
                            new Date(destinationStation.schArr ?? null)
                          )}{" "}
                          (
                          {new Intl.DateTimeFormat([], {
                            hour: "numeric",
                            minute: "numeric",
                            timeZone: destinationStation.tz,
                          }).format(new Date(destinationStation.arr ?? null))}
                          )
                        </li>
                      </ul>
                    </li>
                    <li>
                      <i>Next Stop:</i>{" "}
                      <span>
                        {trainData[0].eventName} ({trainData[0].eventCode})
                      </span>
                      <ul>
                        <li>
                          Arriving at{" "}
                          <span>
                            {new Intl.DateTimeFormat([], {
                              hour: "numeric",
                              minute: "numeric",
                              timeZone: currentStation.tz,
                            }).format(
                              new Date(
                                currentStation.arr ?? currentStation.dep ?? 0
                              )
                            )}{" "}
                            (in{" "}
                            {hoursAndMinutesUnitl(
                              currentStation.arr
                                ? currentStation.arr
                                : currentStation.dep
                            )}
                            )
                          </span>
                        </li>
                        <li>
                          Currently{" "}
                          {colorizedToHoursAndMinutesLate(
                            currentStation.arr
                              ? new Date(currentStation.arr ?? null)
                              : new Date(currentStation.dep ?? null),
                            currentStation.schArr
                              ? new Date(currentStation.schArr ?? null)
                              : new Date(currentStation.schDep ?? null)
                          )}
                        </li>
                      </ul>
                    </li>
                    <li>
                      <i>Heading</i>{" "}
                      <span>{fullDirections[trainData[0].heading]}</span> at{" "}
                      <span>{trainData[0].velocity.toFixed(2)}mph</span>
                    </li>
                    <li>
                      <i>Location:</i> {trainData[0].lat.toFixed(5)},{" "}
                      {trainData[0].lon.toFixed(5)}
                    </li>
                    <li>
                      <i>Last Updated:</i>{" "}
                      {new Intl.DateTimeFormat([], {
                        hour: "numeric",
                        minute: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZoneName: "short",
                      }).format(new Date(trainData[0].lastValTS))}
                    </li>
                    <li>
                      <i>Foamer Mode:</i>{" "}
                      {foamerMode ? (
                        <>
                          {loadingLocation ? (
                            navigatorExists ? (
                              <p>Loading location...</p>
                            ) : (
                              <p>Error. Location permissions not allowed. </p>
                            )
                          ) : (
                            <ul>
                              <li>
                                <i>Train ETA: </i>
                                {calculateTimeTilLocation(
                                  trainData[0],
                                  currentStation,
                                  userLocation
                                )}
                              </li>
                              <li>
                                <i>Train Distance: </i>~
                                {(
                                  calculateDistanceBetweenCoordinates(
                                    trainData[0].lat,
                                    trainData[0].lon,
                                    userLocation[0],
                                    userLocation[1]
                                  ) / 1609.344
                                ).toFixed(2)}
                                mi away
                              </li>
                              <li>
                                <i>Your Location: </i>
                                {userLocation
                                  .map((n) => n.toFixed(5))
                                  .join(", ")}
                              </li>
                            </ul>
                          )}
                        </>
                      ) : (
                        <p>
                          Enable foamer mode in your{" "}
                          <Link to={"/settings"}>Amtraker settings</Link>.
                        </p>
                      )}
                    </li>
                  </ul>
                  <h2>Stations</h2>
                  <div className='stations'>
                    {trainData[0].stations.map((station, i, arr) => {
                      if (i == 10 || (i == arr.length - 1 && arr.length < 10)) {
                        return (
                          <>
                            <Link
                              to={`/stations/${station.code}`}
                              key={`station-${station.code}`}
                              className='station-link'
                            >
                              <ManualStationBox
                                station={station}
                                train={trainData[0]}
                              />
                            </Link>
                            <Banner />
                          </>
                        );
                      } else {
                        return (
                          <Link
                            to={`/stations/${station.code}`}
                            key={`station-${station.code}`}
                            className='station-link'
                          >
                            <ManualStationBox
                              station={station}
                              train={trainData[0]}
                            />
                          </Link>
                        );
                      }
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p>
                    This train is not currently tracking. Please try again
                    later. We apologize for the inconvenience.
                  </p>
                  <button
                    onClick={() => {
                      if (history.state.idx && history.state.idx > 0) {
                        navigate(-1);
                      } else {
                        navigate("/", { replace: true }); //fallback
                      }
                    }}
                  >
                    Go Back
                  </button>
                </>
              )}
            </>
          ) : (
            <p>Loading train...</p>
          )}
        </section>
      </div>
    </>
  );
};

export default BetterTrainPage;
