import "./App.css";
import { useState, useEffect, useMemo } from "react";
import stringToHash from "../../components/money/stringToHash";
import { Link } from "react-router";
import settingsInit from "../../components/settingsInit";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import { autoAddTrains } from "../../tools";
import Moneyyyyyyyy from "../../components/money/moneyyyyyyyy";
import { m } from "../../paraglide/messages.js";

const App = () => {
  document.title = m["common_strings.amtraker_title"]();
  document
    .querySelector('meta[name="description"]')
    .setAttribute(
      "content", m["common_strings.amtraker_meta_description"]());
  document
    .querySelector('meta[property="og:image"]')
    .setAttribute("content", "https://amtraker.com/content/images/amtraker-back.webp");

  const [savedTrains, setSavedTrains] = useState([]);
  const [isStale, setIsStale] = useState(false);
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState(0);
  const [siteLastFetched, setSiteLastFetched] = useState(0);
  const [savedTrainsObjects, setSavedTrainsObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shitsFucked, setShitsFucked] = useState(false);
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);
  const [amtrakerGlobalAlerts, setAmtrakerGlobalAlerts] = useState([]);

  useEffect(() => {
    fetch("https://gks.pgm.sh/api/v1/amtraker_global_alerts")
      .then((res) => res.json())
      .then((data) => {
        console.log("Global Alerts", data);
        setAmtrakerGlobalAlerts(
          (data.response?.object ?? []).map((alert) => {
            return { text: alert, lastUpdated: new Date(data.response?.meta?.updatedAt) };
          })
        );
      });
  }, []);

  const sm_or_tm = useMemo(() => {
    const userAgent = navigator.userAgent;

    if (/Android/.test(userAgent) && sessionStorage.getItem("has_android_twa_referrer") == "true") {
      // we are in the android app
      return "™";
    } else if (/(iPhone|iPod|iPad)(?!.*PWAShell)/.test(userAgent)) {
      // we are in the ios app
      return "™";
    }

    return "℠";
  }, []);

  // download link for if we're in a mobile browser
  const downloadURL = useMemo(() => {
    const userAgent = navigator.userAgent;

    if (/Android/.test(userAgent) && sessionStorage.getItem("has_android_twa_referrer") !== "true") {
      // we are in a browser on android
      return { url: "https://play.google.com/store/apps/details?id=com.amtrak.piero", text: m["common_strings.download_app"]() };
    } else if (/(iPhone|iPod|iPad)(?!.*PWAShell)/.test(userAgent)) {
      // we are in a browser on ios
      return { url: "https://apps.apple.com/us/app/amtraker-track-amtrak-via/id6758903803", text: m["common_strings.download_app"]() };
    } else return null;
  }, []);

  useEffect(() => {
    autoAddTrains().then(() => {
      setSavedTrains(
        localStorage
          .getItem("savedTrainsAmtrakerV3")
          .split(",")
          .filter((n) => n)
      );
    });
  }, []);

  useEffect(() => {
    dataManager.checkDataStatusAndUpdate().then(() => {
      dataManager.getStaleData().then((data) => {
        setIsStale(data.stale);
        setTimeSinceLastUpdate(data.avgLastUpdate);
      });

      dataManager.getShitsFucked().then((data) => setShitsFucked(data));

      if (savedTrains.length === 0) {
        setLoading(false);
      }
      //setSavedTrainsObjects([]);
      let savedTranisObjectsTemp = [];
      savedTrains.forEach((trainID, i, arr) => {
        const shortenedTrainID = `${trainID.split("-")[0]}-${trainID.split("-")[2]}`;

        dataManager
          .getTrain(shortenedTrainID)
          .then((data) => {
            if (i === arr.length - 1) {
              setLoading(false);
            }

            if (Array.isArray(data) && data.length === 0) {
              console.log("removing train due to invalid data");
              const newSavedTrains = localStorage
                .getItem("savedTrainsAmtrakerV3")
                .split(",")
                .filter((n) => n)
                .filter((train) => train !== trainID);

              localStorage.setItem("savedTrainsAmtrakerV3", newSavedTrains.join(","));

              if (i === arr.length - 1) {
                setSavedTrainsObjects(savedTranisObjectsTemp);
              }
              return null;
            }

            const trainData = data[shortenedTrainID.split("-")[0]][0];
            const schDep = new Date(trainData.stations[0].dep);

            //removing train if the saved train id doesn't match the data
            if (
              (schDep.getMonth() + 1 !== parseInt(trainID.split("-")[1]) ||
                schDep.getFullYear().toString().substring(2, 4) !== trainID.split("-")[3]) &&
              !trainID.includes("NaN")
            ) {
              console.log("removing train due to incorrect date");

              const newSavedTrains = localStorage
                .getItem("savedTrainsAmtrakerV3")
                .split(",")
                .filter((n) => n)
                .filter((train) => train !== trainID);

              localStorage.setItem("savedTrainsAmtrakerV3", newSavedTrains.join(","));

              if (i === arr.length - 1) {
                setSavedTrainsObjects(savedTranisObjectsTemp);
              }
              return null;
            }

            savedTranisObjectsTemp.push(
              <Link key={`saved-train-${trainID}`} to={`/trains/${trainID.split("-")[0]}/${trainID.split("-")[2]}`}>
                <ManualTrainBox train={trainData} />
              </Link>
            );

            if (i === arr.length - 1) {
              setSavedTrainsObjects(savedTranisObjectsTemp);
            }
          })
          .catch((err) => {
            console.log(err);

            //removing train if data is invalid

            const newSavedTrains = localStorage
              .getItem("savedTrainsAmtrakerV3")
              .split(",")
              .filter((n) => n)
              .filter((train) => train !== trainID);

            localStorage.setItem("savedTrainsAmtrakerV3", newSavedTrains.join(","));
            return null;
          });
      });
      setSiteLastFetched(Date.now());
    });
  }, [savedTrains]);

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
      {downloadURL ? (
        <a href={downloadURL.url} target="_blank">
          <button
            className="root"
            style={{
              bottom: "8px",
              left: "8px",
              position: "absolute",
              width: "auto",
              height: "48px",
              textAlign: "center",
              lineHeight: "0px"
            }}
          >
            {downloadURL.text}
          </button>
        </a>
      ) : null}
      <button
        className="root"
        style={{
          bottom: "8px",
          right: "8px",
          position: "absolute",
          fontSize: "24px",
          width: "48px",
          height: "48px",
          textAlign: "center",
          lineHeight: "0px"
        }}
        onClick={() => setSavedTrains([...savedTrains])}
      >
        ⟳
      </button>
      <main>
        {/*<h2 className='welcome-to'>Welcome to</h2>*/}
        <div className="titleArea">
          <h1 className="gayTitle">Amtraker</h1>
          <p className="sm_tm">{sm_or_tm}</p>
          {/*}<p className="slogan">Happy holidays!</p>*/}
        </div>
        <section id="section-saved" className="section-border">
          {isStale ? (
            <div className="stale">
              <p>
                <span className="stale-text">{m["common_strings.warning"]()}</span>{" "}
                {m["common_strings.stale_data"]({ minutes: Math.floor(timeSinceLastUpdate / 60000) })}
              </p>
            </div>
          ) : null}
          {amtrakerGlobalAlerts.length > 0 ? (
            <div className="stale" style={{ maxWidth: 600 }}>
              {amtrakerGlobalAlerts.map((alert, i) => {
                console.log(alert);

                return (
                  <p key={`gaa_${i}`}>
                    <span className="stale-text">
                      {m["pages.index.alert_header"]({ number: i + 1, time: alert.lastUpdated.toLocaleTimeString() })}
                    </span>{" "}
                    {alert.text}
                  </p>
                );
              })}
            </div>
          ) : null}
          {shitsFucked ? (
            <div className="stale">
              <p>
                <span className="stale-text">{m["common_strings.warning"]()}</span> {m["common_strings.shitsfucked"]()}
              </p>
            </div>
          ) : null}
          {/*}
          <div className='stale'>
            <p>
              <span className='stale-text'>Warning:</span> Our server host is having traffic issues. While our services are largely unaffected, longer loading times can be expected.
            </p>
          </div>
          */}
          <h2 style={{ fontWeight: 500, fontSize: "1.2rem" }}>{m["pages.index.saved_trains"]()}</h2>
          <div className="savedTrains">
            {loading ? (
              <div className="loading">{m["common_strings.loading"]()}...</div>
            ) : savedTrainsObjects.length > 0 ? (
              <>
                {savedTrainsObjects}
                <p>{m["pages.index.data_last_fetched"]()}: {new Date(siteLastFetched).toLocaleTimeString()}</p>
              </>
            ) : (
              <div>{m["pages.index.no_saved_trains"]()}</div>
            )}
          </div>
        </section>
        <h3 style={{ margin: "-4px 0px 0px 0px" }}>{m['common_strings.or']()}</h3>
        <div className="links">
          <Link to={"/trains"}>
            <button className="root">{m["pages.index.trains_list"]()}</button>
          </Link>

          <Link to={"/stations"}>
            <button className="root">{m["pages.index.stations_list"]()}</button>
          </Link>
        </div>
        <div className="links">
          <Link to={"/map"}>
            <button className="root">{m["pages.index.live_map"]()}</button>
          </Link>
          <Link to={"/atlas"}>
            <button className="root">{m["pages.index.atlas"]()}</button>
          </Link>
        </div>

        <section className="footer section-border">
          <p>Amtraker v3.21.19</p>
          <div>
            <Link to="/about">
              <p>{m["pages.index.about_settings_privacy"]()}</p>
            </Link>
            {/*}
            <Link to="/about">
              <p>About</p>
            </Link>
            {*/}
            <p>
              <a href="https://api.amtraker.com/docs" target="_blank">
                {m["pages.index.api_docs"]()}
              </a>
            </p>
          </div>
          <p>
            &copy;{" "}
            <a href="https://piemadd.com" target="_blank">
              Piero Maddaleni
            </a>{" "}
            2026
          </p>
        </section>
        <Moneyyyyyyyy />
      </main>
    </>
  );
};

export default App;
