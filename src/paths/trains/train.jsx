import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import stringToHash from "../../components/money/stringToHash";
import { stationMeta } from "../../data/stations.js";
import "./trains.css";
import SettingsInit from "../index/settingsInit";
import SenseList from "../../components/money/senseList";
import {
  deleteTrain,
  hoursAndMinutesUnitl,
  toHoursAndMinutesLate,
  colorizedToHoursAndMinutesLate,
  calculateDistanceBetweenCoordinates,
  presetExponential,
  calculateTimeTilLocation,
  addAlwaysTracked,
  removeAlwaysTracked,
} from "../../tools";

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

const BetterTrainPage = () => {
  const { trainNum, trainDate } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [foamerMode, setFoamerMode] = useState(false);
  const [alwaysTracked, setAlwaysTracked] = useState(false);
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
            let departureDate = new Date(data[trainNum][0].stations[0].schDep);

            if (departureDate.toString() == "Invalid Date") {
              departureDate = new Date(data[trainNum][0].stations[0].schDep);
            }

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

    console.log(
      "alwaysTrackedAmtrakerV3:",
      localStorage.getItem("alwaysTrackedAmtrakerV3")
    );
    console.log("trainNum:", trainNum);

    if (
      localStorage
        .getItem("alwaysTrackedAmtrakerV3")
        .split(",")
        .includes(trainNum)
    ) {
      console.log("is always tracked");
      setAlwaysTracked(true);
    }
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
          "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
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
                  <h2>Manage Train:</h2>
                  <p
                    className='click'
                    style={{ textDecoration: "underline", marginTop: "-6px" }}
                    onClick={() => {
                      deleteTrain(trainNum, trainDate);

                      if (history.state.idx && history.state.idx > 0) {
                        navigate(-1);
                      } else {
                        navigate("/", { replace: true }); //fallback
                      }
                    }}
                  >
                    Delete Train
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "1.5rem",
                      fontWeight: "300",
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={alwaysTracked}
                      onChange={(e) => {
                        setAlwaysTracked(e.target.checked);
                        if (e.target.checked) {
                          addAlwaysTracked(trainNum);
                        } else {
                          removeAlwaysTracked(trainNum);
                        }
                        console.log("always tracked change:", e.target.checked);
                      }}
                    />
                    <label>Always Track Train {trainNum}</label>
                  </div>
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
                      if (
                        (i % 10 === 0 ||
                          (i == arr.length - 1 && arr.length < 10)) &&
                        i !== 0
                      ) {
                        return (
                          <div key={`with-terra-banner-${i}`}>
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
                            <SenseList
                              key={`sense-list-${i}`}
                              dataAdSlot={"6510210014"}
                            />
                          </div>
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
