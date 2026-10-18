import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { useEffect, useState, useMemo } from "react";
import "./trains.css";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import MiniMap from "../../components/mapping/miniMap";
import ShareButton from "../../components/buttons/shareButton";
import Moneyyyyyyyy from "../../components/money/moneyyyyyyyy";
import { m } from "../../paraglide/messages.js";

const providerShorts = { Amtrak: "AMTK", Via: "VIA", Brightline: "BLNE" };

const BetterTrainsByNumber = () => {
  const { trainNum } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [altTrainData, setAltTrainData] = useState(null);
  const [filteredTrainIDs, setFilteredTrainIDs] = useState([]);
  const [filteredStationCodes, setFilteredStationCodes] = useState([]);

  useEffect(() => {
    dataManager.getTrain(trainNum).then((data) => {
      if (Array.isArray(data) && Object.keys(data).length === 0) {
        console.log("is not valid");

        let railroadToFetch = "amtrak";
        if (trainNum.startsWith("b")) railroadToFetch = "brightline";
        if (trainNum.startsWith("v")) railroadToFetch = "via_rail";

        fetch(`https://store.transitstat.us/amtraker_route_meta/${railroadToFetch}/trainsByNum/${trainNum}`)
          .then((res) => res.json())
          .then((altData) => {
            const nextDep = new Date(altData.nextDep);
            const nextDepISO = nextDep.toISOString();
            const nextDepDate = new Intl.DateTimeFormat("en-US", {
              timeZone: altData.stops[0]?.tz ?? "America/New_York",
              day: "numeric"
            }).format(nextDep);

            let mockTrainObject = {
              dataSource: "amtraker-v3",
              routeName: altData.routeName,
              trainNum: altData.trainNum,
              trainNumRaw: altData.trainNumRaw,
              trainID: `${altData.trainNum}-${nextDepDate}`,
              lat: 0,
              lon: 0,
              trainTimely: "",
              iconColor: "#2a893d",
              textColor: "#ffffff",
              stations: altData.stops.map((stop) => {
                return {
                  name: stop.name,
                  code: stop.code,
                  tz: stop.tz,
                  bus: false,
                  schArr: nextDepISO,
                  schDep: nextDepISO,
                  arr: nextDepISO,
                  dep: nextDepISO,
                  arrCmnt: "",
                  depCmnt: "",
                  status: "Enroute",
                  stopIconColor: "#2a893d",
                  platform: ""
                };
              }),
              heading: "N",
              eventCode: altData.stops[0].code,
              eventTZ: altData.stops[0].tz,
              eventName: altData.stops[0].name,
              origCode: altData.stops[0].code,
              originTZ: altData.stops[0].tz,
              origName: altData.stops[0].name,
              destCode: altData.stops.at(-1).code,
              destTZ: altData.stops.at(-1).tz,
              destName: altData.stops.at(-1).name,
              trainState: "Predeparture",
              velocity: 0,
              statusMsg: " ",
              createdAt: nextDepISO,
              updatedAt: nextDepISO,
              lastValTS: nextDepISO,
              provider: altData.provider,
              providerShort: providerShorts[altData.provider],
              onlyOfTrainNum: true,
              alerts: []
            };

            setAltTrainData({ ...altData, mockTrainObject });

            setFilteredTrainIDs([]);
            setFilteredStationCodes(altData.stops.map((stop) => stop.code));

            setLoading(false);
          })
          .catch((e) => {
            // isnt a valid train
            setLoading(false);
          });
      } else {
        console.log("is valid");

        const sorted = data[trainNum].sort((a, b) => {
          return Number(a.trainID.split("-")[1]) - Number(b.trainID.split("-")[1]);
        });

        setFilteredTrainIDs(data[trainNum].map((train) => train.trainID));
        setFilteredStationCodes(data[trainNum].flatMap((train) => train.stations.map((station) => station.code)));

        setTrainData(sorted);
        setLoading(false);
      }
    });
  }, [trainNum, navigate]);

  if (trainData[0] && !loading) {
    document.title = m["pages.trains.page_title"]({ provider: trainData[0].provider, trainNum: trainData[0].trainNumRaw });
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        m["pages.trains.meta_description"]({
          provider: trainData[0].provider,
          routeName: trainData[0].routeName,
          trainNum: trainData[0].trainNumRaw
        })
      );
    document
      .querySelector('meta[property="og:image"]')
      .setAttribute("content", `https://ogimg.transitstat.us/images?service=amtraker&type=train&code=${trainNum}`);
  } else {
    document.title = m["pages.trains.page_title_generic"]({ trainNum });
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", m["pages.trains.meta_description_generic"]({ trainNum }));
    document
      .querySelector('meta[property="og:image"]')
      .setAttribute("content", `https://ogimg.transitstat.us/images?service=amtraker&type=train&code=${trainNum}`);
  }

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash == "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
        hash == "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });
  }, []);

  return (
    <>
      <img id="background" alt={m["common_strings.background_alt"]()} className={bgClass + " terrabanner"} src={bgURL}></img>
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
              style={{ paddingLeft: "32px", fontSize: "24px", fontWeight: 500 }}
            >
              {m["common_strings.back"]()}
            </p>
            <div className="multiButtonHolder">
              <ShareButton
                navigatorOptions={{
                  title: m["pages.trains.share_title"]({ provider: trainData[0]?.provider, routeName: trainData[0]?.routeName }),
                  url: `https://amtraker.com/trains/${trainData[0]?.trainID.split("-").join("/")}`
                }}
              />
            </div>
          </div>
        ) : null}
        <div
          className="multiSectionHolder"
          style={{ height: searchParams.has("oembed") ? "calc(100svh - 64px)" : "calc(100svh - 114px)" }}
        >
          <section
            className="section-trainPage"
            style={{
              height: searchParams.has("oembed") ? "calc(100svh - 64px)" : "calc(100svh - 114px)",
              minWidth: "300px",
              maxWidth: window.innerWidth >= 900 ? "398px" : null // only setting max size if we have the map
            }}
          >
            {trainData.length > 0 ? (
              <>
                <h2 style={{ marginTop: -12, marginBottom: -12 }}>
                  {m["pages.trains.by_number.heading"]({ provider: trainData[0].provider, trainNum: trainData[0].trainNumRaw })}
                </h2>
                <p style={{ lineHeight: 1.4 }}>
                  {m["pages.trains.by_number.route_description"]({
                    routeName: trainData[0].routeName,
                    origin: trainData[0].stations[0].name,
                    destination: trainData[0].stations.at(-1).name
                  })}{" "}
                  {m["pages.trains.by_number.select_train_prompt"]()}
                </p>
              </>
            ) : altTrainData ? (
              <>
                <h2 style={{ marginTop: -12, marginBottom: -12 }}>
                  {m["pages.trains.by_number.heading"]({ provider: altTrainData.provider, trainNum: altTrainData.trainNumRaw })}
                </h2>
                <p style={{ lineHeight: 1.4 }}>
                  {m["pages.trains.by_number.route_description"]({
                    routeName: altTrainData.routeName,
                    origin: altTrainData.stops[0].name,
                    destination: altTrainData.stops.at(-1).name
                  })}
                </p>
                <br />
              </>
            ) : (
              <>
                <h2 style={{ marginTop: -12, marginBottom: -12 }}>{m["pages.trains.by_number.heading_generic"]({ trainNum })}</h2>
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
                  gap: "8px"
                }}
              >
                {trainData.length > 0 ? (
                  trainData.map((train, i, arr) => {
                    return (
                      <>
                      <Link
                        to={`/trains/${train.trainID.split("-").join("/")}`}
                        key={`train-${train.trainID}`}
                        id={train.trainID}
                        className="station-link"
                        style={{ width: "calc(100% - 26px)" }}
                      >
                        <ManualTrainBox train={train} maxWidth={true} />
                      </Link>
                      {i == arr.length - 1 ? <Moneyyyyyyyy /> : null}
                      </>
                    );
                  })
                ) : altTrainData ? (
                  <>
                    <ManualTrainBox train={altTrainData.mockTrainObject} maxWidth={true} includeNextStopTime={true} />

                    <p>
                      <small>
                        {m["pages.trains.by_number.scheduled_departure"]({
                          station: altTrainData.stops[0].name,
                          time: new Date(altTrainData.nextDep).toLocaleTimeString([], {
                            timeZone: altTrainData.stops[0].tz,
                            timeStyle: "short"
                          }),
                          date: new Date(altTrainData.nextDep).toLocaleDateString([], {
                            timeZone: altTrainData.stops[0].tz,
                            dateStyle: "long"
                          })
                        })}
                      </small>
                    </p>
                    <p>
                      <small>{m["pages.trains.by_number.trackable_note"]()}</small>
                    </p>
                    <Moneyyyyyyyy />
                  </>
                ) : (
                  <>
                    <p>
                      {m["pages.trains.by_number.does_not_exist"]()}
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
                        {m["common_strings.go_back"]()}
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <p>{m["common_strings.loading_train"]()}...</p>
            )}
          </section>
          {window.innerWidth >= 900 && !loading ? (
            <section
              className="section-trainPage"
              style={{
                height: searchParams.has("oembed") ? "calc(100svh - 32px)" : "calc(100svh - 82px)",
                padding: 0,
                borderColor: "#444"
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
