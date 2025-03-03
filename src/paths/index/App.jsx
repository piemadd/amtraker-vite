import "./App.css";
import { useState, useEffect, useMemo } from "react";
import stringToHash from "../../components/money/stringToHash";
import { Link } from "react-router-dom";
import settingsInit from "../../components/settingsInit";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import SenseBlock from "../../components/money/senseArticle";
import { autoAddTrains } from "../../tools";

const App = () => {
  const [savedTrains, setSavedTrains] = useState([]);
  const [isStale, setIsStale] = useState(false);
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState(0);
  const [siteLastFetched, setSiteLastFetched] = useState(0);
  const [savedTrainsObjects, setSavedTrainsObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shitsFucked, setShitsFucked] = useState(false);
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

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
        const shortenedTrainID = `${trainID.split("-")[0]}-${trainID.split("-")[2]
          }`;

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

              localStorage.setItem(
                "savedTrainsAmtrakerV3",
                newSavedTrains.join(",")
              );

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
                schDep.getFullYear().toString().substring(2, 4) !==
                trainID.split("-")[3]) &&
              !trainID.includes("NaN")
            ) {
              console.log("removing train due to incorrect date");

              const newSavedTrains = localStorage
                .getItem("savedTrainsAmtrakerV3")
                .split(",")
                .filter((n) => n)
                .filter((train) => train !== trainID);

              localStorage.setItem(
                "savedTrainsAmtrakerV3",
                newSavedTrains.join(",")
              );

              if (i === arr.length - 1) {
                setSavedTrainsObjects(savedTranisObjectsTemp);
              }
              return null;
            }

            savedTranisObjectsTemp.push(
              <Link
                key={`saved-train-${trainID}`}
                to={`/trains/${trainID.split("-")[0]}/${trainID.split("-")[2]}`}
              >
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

            localStorage.setItem(
              "savedTrainsAmtrakerV3",
              newSavedTrains.join(",")
            );
            return null;
          });
      });
      setSiteLastFetched(Date.now())
    });
  }, [savedTrains]);

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
      <button
        className='root'
        style={{
          bottom: '8px',
          right: '8px',
          position: 'absolute',
          fontSize: '24px',
          width: '48px',
          height: '48px',
          textAlign: 'center',
          lineHeight: '0px'
        }}
        onClick={() => setSavedTrains([...savedTrains])}
      >⟳</button>
      <main>
        {/*<h2 className='welcome-to'>Welcome to</h2>*/}
        <div className="titleArea">
          <h1 className='gayTitle'>Amtraker</h1>
          {/*<p className="slogan">Get out and Vote!</p>*/}
        </div>
        <section id='section-saved'>
          {isStale ? (
            <div className='stale'>
              <p>
                <span className='stale-text'>Warning:</span> Data is stale.
                Trains were last updated on average{" "}
                {Math.floor(timeSinceLastUpdate / 60000)} minutes ago.
              </p>
            </div>
          ) : null}
          {shitsFucked ? (
            <div className='stale'>
              <p>
                <span className='stale-text'>Warning:</span>
                The Amtrak API seems to be having issues currently! Please try
                again later...
              </p>
            </div>
          ) : null}
          <h2
            style={{
              fontWeight: 500,
              fontSize: "1.2rem",
            }}
          >
            Saved Trains
          </h2>
          <div className='savedTrains'>
            {loading ? (
              <div className='loading'>Loading...</div>
            ) : savedTrainsObjects.length > 0 ? (
              <>{savedTrainsObjects}
                <p>Data Last Fetched at: {new Date(siteLastFetched).toLocaleTimeString()}</p>
              </>
            ) : (
              <div>No Saved Trains</div>
            )}
          </div>
        </section>
        <h3 className='split'>or</h3>
        <div className='links'>
          <Link to={"/trains"}>
            <button className='root'>Track a new Train</button>
          </Link>
        </div>
        <div className='links'>
          <Link to={"/map"}>
            <button className='root'>View the Map</button>
          </Link>

          <Link to={"/stations"}>
            <button className='root'>Full Stations List</button>
          </Link>
        </div>

        <section className='footer'>
          <p>
            <a
              href='https://docs.google.com/forms/d/e/1FAIpQLSfLfypJxtK62zBakCzo23y-WKFZj_TjbX5pKGZ08gxOeBatkg/viewform?usp=sf_link'
              target='blank'
            >
              Feedback
            </a>
          </p>
          <Link to='/about'>
            <p>About</p>
          </Link>
          <Link to='/settings'>
            <p>Settings</p>
          </Link>
          <Link to='/privacy'>
            <p>Privacy Policy</p>
          </Link>
        </section>
        <section className='amtrakerVersion'>
          <p>Amtraker Beta 3.13.0 Build 12</p>
          <p>&copy; <a href="https://piemadd.com" target="_blank">Piero Maddaleni</a> 2025</p>
        </section>
        <SenseBlock key={"sense-block"} dataAdSlot={"3140178047"} />
      </main>
    </>
  );
};

export default App;
