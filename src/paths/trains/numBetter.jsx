import {
  useParams,
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./trains.css";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import MiniMap from "../../components/mapping/miniMap";
import ShareButton from "../../components/buttons/shareButton";

const BetterTrainsByNumber = () => {
  const { trainNum } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [filteredTrainIDs, setFilteredTrainIDs] = useState([]);
  const [filteredStationCodes, setFilteredStationCodes] = useState([]);

  useEffect(() => {
    dataManager.getTrain(trainNum).then((data) => {
      setLoading(false);
      if (Array.isArray(data) && Object.keys(data).length === 0) {
        console.log("is not valid");
      } else {
        console.log("is valid");

        const sorted = data[trainNum].sort((a, b) => {
          return (
            Number(a.trainID.split("-")[1]) - Number(b.trainID.split("-")[1])
          );
        });

        console.log(data[trainNum]);
        setFilteredTrainIDs(data[trainNum].map((train) => train.trainID));
        setFilteredStationCodes(
          data[trainNum].flatMap((train) =>
            train.stations.map((station) => station.code),
          ),
        );

        setTrainData(sorted);
      }
    });
  }, [trainNum, navigate]);

  if (trainData[0] && !loading) {
    document.title = `${trainData[0].provider} Train ${trainData[0].trainNumRaw} Tracker - Amtraker`;
  } else {
    document.title = `Train ${trainNum} Tracker - Amtraker`;
  }

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
        id="backgroundNew"
        alt="Map of Australia."
        className={"bg-focus-in peppino"}
        src={"/content/images/waow.png"}
      ></img>
      <img
        id="background"
        alt="Amtrak network map."
        className={bgClass + " terrabanner"}
        src={bgURL}
      ></img>
      <div className="trainPage">
        {!searchParams.has("oembed") ? (
          <div className="header-trainpage">
            <p
              onClick={() => {
                if (history.state.idx && history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className="click"
              style={{
                paddingLeft: "32px",
                fontSize: "24px",
                fontWeight: 500,
              }}
            >
              Back
            </p>
            <div className="multiButtonHolder">
              <ShareButton
                navigatorOptions={{
                  title: `Track the ${trainData[0]?.provider} ${trainData[0]?.routeName} Train with Amtraker!`,
                  url: `https://amtraker.com/trains/${trainData[0]?.trainID
                    .split("-")
                    .join("/")}`,
                }}
              />
            </div>
          </div>
        ) : null}
        <div
          className="multiSectionHolder"
          style={{
            height: searchParams.has("oembed")
              ? "calc(100svh - 64px)"
              : "calc(100svh - 114px)",
          }}
        >
          <section
            className="section-trainPage"
            style={{
              height: searchParams.has("oembed")
                ? "calc(100svh - 64px)"
                : "calc(100svh - 114px)",
              minWidth: "300px",
              maxWidth: window.innerWidth >= 900 ? "398px" : null, // only setting max size if we have the map
            }}
          >
            {trainData.length > 0 ? (
              <>
                <h2
                  style={{
                    marginTop: -12,
                    marginBottom: -12,
                  }}
                >
                  {trainData[0].provider} Train {trainData[0].trainNumRaw}
                </h2>
                <p
                  style={{
                    lineHeight: 1.4,
                  }}
                >
                  Track Amtrak's {trainData[0].routeName} from{" "}
                  {trainData[0].stations[0].name} Station to{" "}
                  {trainData[0].stations.at(-1).name} Station. Please select a
                  currently tracking train:
                </p>
              </>
            ) : (
              <>
                <h2
                  style={{
                    marginTop: -12,
                    marginBottom: -12,
                  }}
                >
                  Train {trainNum}
                </h2>
              </>
            )}
            {!loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "left",
                  justifyContent: "left",
                  width: "100%",
                  gap: "8px",
                }}
              >
                {trainData.length > 0 ? (
                  trainData.map((train) => {
                    return (
                      <Link
                        to={`/trains/${train.trainID.split("-").join("/")}`}
                        key={`train-${train.trainID}`}
                        id={train.trainID}
                        className="station-link"
                        style={{
                          width: "calc(100% - 26px)",
                        }}
                      >
                        <ManualTrainBox train={train} maxWidth={true} />
                      </Link>
                    );
                  })
                ) : (
                  <>
                    <p>
                      This train is not currently tracking. Please try again
                      later. We apologize for the inconvenience.
                    </p>
                    {!searchParams.has("oembed") ? (
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
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <p>Loading train...</p>
            )}
          </section>
          {window.innerWidth >= 900 && !loading ? (
            <section
              className="section-trainPage"
              style={{
                height: searchParams.has("oembed")
                  ? "calc(100svh - 32px)"
                  : "calc(100svh - 82px)",
                padding: 0,
                borderColor: "#444",
              }}
            >
              <MiniMap
                filteredTrainIDs={filteredTrainIDs}
                filteredStationCodes={filteredStationCodes}
                zoomToTrains={false}
                zoomToStations={true}

                //idLinkType={'station'}
              />
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default BetterTrainsByNumber;
