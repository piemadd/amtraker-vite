import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import stringToHash from "../../components/money/stringToHash";
import "./trains.css";
import settingsInit from "../../components/settingsInit";
import {
  initAlwaysTracked,
  addAlwaysTracked,
  removeAlwaysTracked,
  getSavedTrain,
  manageSavedTrain,
} from "../../tools";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import SenseBlock from "../../components/money/senseArticle";
import ShareButton from "../../components/buttons/shareButton";

const BetterTrainPage = () => {
  const { trainNum, trainDate } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);
  
  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [alwaysTracked, setAlwaysTracked] = useState(false);

  useEffect(() => {
    console.log("sending request");
    dataManager.getTrain(`${trainNum}-${trainDate}`).then((data) => {
      setLoading(false);
      if (Array.isArray(data) && Object.keys(data).length === 0) {
        console.log("is not valid");
      } else {
        console.log("is valid");
        setTrainData(data[trainNum]);
      }
    });
  }, [trainNum, trainDate]);

  useEffect(() => {
    initAlwaysTracked();
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

    setIsSaved(getSavedTrain(trainNum, trainDate));
  }, []);

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
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
        {!searchParams.has("oembed") ? (
          <div className='header-trainpage'>
            <h2
              onClick={() => {
                if ((history.state.idx && history.state.idx > 0)) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className='click'
              style={{ paddingLeft: '32px' }}
            >
              Back
            </h2>
            <div className="multiButtonHolder">
              <ShareButton navigatorOptions={{
                title: `Track the ${trainData[0]?.provider} ${trainData[0]?.routeName} Train with Amtraker!`,
                url: `https://amtraker.com/trains/${trainData[0]?.trainID
                  .split("-")
                  .join("/")}`,
              }} />
            </div>
          </div>
        ) : null}
        <section
          className='section-trainPage'
          style={{
            height: searchParams.has("oembed")
              ? "calc(100dvh - 64px)"
              : "calc(100dvh - 114px)",
          }}
        >
          {!loading ? (
            <>
              {trainData.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      width: "100%",
                      marginBottom: "8px",
                    }}
                  >
                    <ManualTrainBox
                      train={trainData[0]}
                      loading={false}
                      maxWidth={true}
                    />
                  </div>
                  {
                    trainData[0].alerts.length > 0 ? (
                      <details className="train-box train-box-max-width" style={{
                        marginTop: '-4px',
                        marginBottom: '4px',
                      }}>
                        <summary>Alerts</summary>
                        <ul>
                        {
                          trainData[0].alerts.map((alert) => {
                            return <li>{alert.message}</li>
                          })
                        }
                        </ul>
                      </details>
                    ) : null}
                  {!searchParams.has("oembed") ? (
                    <>
                      <h2>Manage Train:</h2>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          fontSize: "1.5rem",
                          fontWeight: "300",
                          marginLeft: '8px',
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={isSaved}
                          onChange={(e) => {
                            setIsSaved(e.target.checked);
                            manageSavedTrain(trainNum, trainDate, e.target.checked);
                            console.log(
                              "saved change:",
                              e.target.checked
                            );
                          }}
                        />
                        <label>Save Train {trainNum} ({trainDate})</label>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          fontSize: "1.5rem",
                          fontWeight: "300",
                          marginLeft: '8px',
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
                            console.log(
                              "always tracked change:",
                              e.target.checked
                            );
                          }}
                        />
                        <label>Save Every Train {trainNum}</label>
                      </div>
                    </>
                  ) : null}
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


                  <h2>Stations</h2>
                  <div className='stations'>
                    {trainData[0].stations.map((station, i, arr) => {
                      if (
                        (i % 10 === 0 ||
                          (i == arr.length - 1 && arr.length < 10)) &&
                        i !== 0
                      ) {
                        return (
                          <>
                            <Link
                              to={`/stations/${station.code}`}
                              key={`station-${station.code}`}
                              className='station-link'
                              style={{
                                width: 'calc(100% - 18px)'
                              }}
                            >
                              <ManualStationBox
                                station={station}
                                train={trainData[0]}
                              />
                            </Link>
                            <SenseBlock
                              key={`sense-list-${i}`}
                              dataAdSlot={"2090024099"}
                            />
                          </>
                        );
                      } else {
                        return (
                          <Link
                            to={`/stations/${station.code}`}
                            key={`station-${station.code}`}
                            className='station-link'
                            style={{
                              width: 'calc(100% - 18px)'
                            }}
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
                  {!searchParams.has("oembed") ? (
                    <button
                      onClick={() => {
                        if ((history.state.idx && history.state.idx > 0)) {
                          navigate(-1);
                        } else {
                          navigate("/", { replace: true }); //fallback
                        }
                      }}
                    >
                      Go Back
                    </button>
                  ) : null}
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
