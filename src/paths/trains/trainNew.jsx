import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ManualStationBox from "../../components/stationBox/manualStationBox";

import { stationMeta } from "../../data/stations.js";

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
    return "Estimate Error";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Schedule Error";

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
    if (!foamerMode || !('geolocation' in navigator)) {
      console.log("no geolocation");
    }
    setNavigatorExists(true);
    navigator.geolocation.getCurrentPosition((res) => {
      setLoadingLocation(false);
      setUserLocation([res.coords.latitude, res.coords.longitude]);
    });
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
  return (
    <>
      <img
        alt={"A slightly blurred version of a map of Amtrak's Network"}
        id='background'
        className='bg-focus-in'
        src='/content/images/amtraker-bg.webp'
      ></img>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
            className='click'
          >
            Back
          </h2>
          <h2
            className='click'
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
                    return (
                      element.split("-")[0] !== trainNum &&
                      element.split("-")[2] !== trainDate
                    );
                  })
                  .join(",")
              );

              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
          >
            Delete Train
          </h2>
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
                  {navigator.share ? (
                    <p
                      onClick={() => {
                        navigator.share({
                          title: `Track the Amtrak ${trainData[0].routeName} Train with Amtraker!`,
                          url: `https://amtraker.com/trains/${trainData[0].trainID
                            .split("-")
                            .join("/")}`,
                        });
                      }}
                      style={{ textDecoration: "underline", marginTop: "-6px" }}
                      className='click'
                    >
                      Share Train
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
                            new Date(originStation.dep),
                            new Date(originStation.schDep)
                          )}{" "}
                          (
                          {new Intl.DateTimeFormat([], {
                            hour: "numeric",
                            minute: "numeric",
                            timeZone: originStation.tz,
                            timeZoneName: "short",
                          }).format(new Date(originStation.dep))}
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
                            new Date(destinationStation.arr),
                            new Date(destinationStation.schArr)
                          )}{" "}
                          (
                          {new Intl.DateTimeFormat([], {
                            hour: "numeric",
                            minute: "numeric",
                            timeZone: destinationStation.tz,
                            timeZoneName: "short",
                          }).format(new Date(destinationStation.arr))}
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
                          Arriving in about{" "}
                          <span>
                            {hoursAndMinutesUnitl(
                              currentStation.arr
                                ? currentStation.arr
                                : currentStation.dep
                            )}{" "}
                            (
                            {new Intl.DateTimeFormat([], {
                              hour: "numeric",
                              minute: "numeric",
                              timeZone: currentStation.tz,
                              timeZoneName: "short",
                            }).format(
                              currentStation.arr
                                ? new Date(currentStation.arr)
                                : new Date(currentStation.dep)
                            )}
                            )
                          </span>
                        </li>
                        <li>
                          Currently{" "}
                          {colorizedToHoursAndMinutesLate(
                            currentStation.arr
                              ? new Date(currentStation.arr)
                              : new Date(currentStation.dep),
                            currentStation.schArr
                              ? new Date(currentStation.schArr)
                              : new Date(currentStation.schDep)
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
                    {trainData[0].stations.map((station, index) => {
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
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p>
                    This train is not currently tracking. Please try again
                    later. We apologize for the inconvenience.
                  </p>
                  <button onClick={() => navigate(-1)}>Go Back</button>
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
