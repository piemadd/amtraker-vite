import "./App.css";
import { useState, useEffect } from "react";
import stringToHash from "../../components/money/stringToHash";
import { Link } from "react-router-dom";

import SettingsInit from "./settingsInit.jsx";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import Banner from "../../components/money/terraBanner";

const App = () => {
  const [savedTrains, setSavedTrains] = useState([]);
  const [isStale, setIsStale] = useState(false);
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState(0);
  const [savedTrainsObjects, setSavedTrainsObjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("savedTrainsAmtrakerV3")) {
      localStorage.setItem("savedTrainsAmtrakerV3", "");
    }

    setSavedTrains(
      localStorage
        .getItem("savedTrainsAmtrakerV3")
        .split(",")
        .filter((n) => n)
    );
  }, []);

  console.log(savedTrains);

  useEffect(() => {
    fetch("https://api-v3.amtraker.com/v3/stale")
      .then((res) => res.json())
      .then((data) => {
        setIsStale(data.stale);
        setTimeSinceLastUpdate(data.avgLastUpdate);
      });

    if (savedTrains.length === 0) {
      setLoading(false);
    }
    //setSavedTrainsObjects([]);
    let savedTranisObjectsTemp = [];
    savedTrains.forEach((trainID, i, arr) => {
      const shortenedTrainID = `${trainID.split("-")[0]}-${
        trainID.split("-")[2]
      }`;

      fetch(`https://api-v3.amtraker.com/v3/trains/${shortenedTrainID}`)
        .then((res) => res.json())
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
  }, [savedTrains]);

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
      <main>
        <h2 className='welcome-to'>Welcome to</h2>
        <h1>Amtraker</h1>
        <SettingsInit />
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
          <h2 style={{
            fontWeight: 500,
            fontSize: "1.2rem",
          }}>Track a Saved Train</h2>
          <div className='savedTrains'>
            {loading ? (
              <div className='loading'>Loading...</div>
            ) : savedTrainsObjects.length > 0 ? (
              savedTrainsObjects
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
          <p>Amtraker v3.4.5</p>
          <p>&copy; Piero Maddaleni 2023</p>
          {/*
          <p>
            <a
              href='https://forms.gle/Fp6fVc2wqVLZKXKq9'
              target='__blank'
              style={{
                textDecoration: "underline",
              }}
            >
              Give Feedback
            </a>
          </p>
          */}
        </section>
        <Banner key={"terra-banner"} />
      </main>
    </>
  );
};

export default App;
