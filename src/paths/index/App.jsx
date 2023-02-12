import "./App.css";
import { useState, useEffect } from "react";
import { trainNames } from "../../data/trains";
import { Link } from "react-router-dom";

import TrainIDTrainBox from "../../components/trainBox/trainIDTrainBox.jsx";
import SettingsInit from "./settingsInit.jsx";

const App = () => {
  const [savedTrains, setSavedTrains] = useState([]);
  const [trainName, setTrainName] = useState("Acela");
  const [trainNumber, setTrainNumber] = useState("");

  const [trainLink, setTrainLink] = useState("/trains/names/Acela");

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

  const callbackIfInvalid = (trainID) => {
    const newSavedTrains = localStorage
      .getItem("savedTrainsAmtrakerV3")
      .split(",")
      .filter((n) => n)
      .filter((train) => train !== trainID);
  
      setSavedTrains(newSavedTrains);
  
    localStorage.setItem("savedTrainsAmtrakerV3", newSavedTrains.join(","));
  };

  const updateTrainLink = (
    routeName = trainName,
    routeNumber = trainNumber
  ) => {
    if (routeNumber !== "") {
      setTrainLink(`/trains/${routeNumber}`);
    } else {
      setTrainLink(`/trains/names/${routeName}`);
    }
  };

  return (
    <>
      <img
        alt={"A slightly blurred version of a map of Amtrak's Network"}
        id='background'
        className='bg-focus-in'
        src='content/images/amtraker-bg.webp'
      ></img>
      <main>
        <h2 className='welcome-to'>Welcome to</h2>
        <h1>Amtraker</h1>
        <SettingsInit />
        <section id='section-saved'>
          <h3>Track a Saved Train</h3>
          <div className='savedTrains'>
            {savedTrains.length > 0 ? (
              savedTrains.map((train) => {
                return (
                  <Link
                    key={`saved-train-${train}`}
                    to={`/trains/${train.split("-")[0]}/${train.split("-")[2]}`}
                  >
                    <TrainIDTrainBox trainID={train} callBackIfInvalid={callbackIfInvalid}/>
                  </Link>
                );
              })
            ) : (
              <div>No Saved Trains</div>
            )}
          </div>
        </section>
        <h3 className='split'>or</h3>
        {/*
        <section className='section-new'>
          <h3>Track a New Train</h3>
          <div>
            <h4>Choose your Train Name:</h4>
            <select
              name='trainName'
              id='trainName'
              value={trainName}
              onChange={(e) => {
                setTrainName(e.target.value);
                updateTrainLink(e.target.value, trainNumber);
              }}
            >
              {[...new Set(Object.values(trainNames))]
                .sort()
                .map((trainName) => {
                  return (
                    <option
                      key={`train-selector-${trainName}`}
                      value={trainName}
                    >
                      {trainName}
                    </option>
                  );
                })}
            </select>
          </div>
          <h4>or</h4>
          <div>
            <h4>Enter your Train Number:</h4>
            <input
              type='text'
              value={trainNumber}
              onChange={(e) => {
                setTrainNumber(e.target.value);
                updateTrainLink(trainName, e.target.value);
              }}
            ></input>
            <br />
            <Link to={trainLink}>
              <button>Track Train</button>
            </Link>
          </div>
        </section>
        <h3 className='split'>or</h3>
        */}
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
          <Link to='/privacy.html'>
            <p>Privacy Policy</p>
          </Link>
          <Link to='/about'>
            <p>About</p>
          </Link>
          <Link to='/trains/full'>
            <p>Train Index</p>
          </Link>
          <Link to='/settings'>
            <p>Settings</p>
          </Link>
        </section>
      </main>
    </>
  );
};

export default App;
