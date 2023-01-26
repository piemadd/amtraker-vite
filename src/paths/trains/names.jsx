import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { trainNames } from "../../data/trains";
import "./trains.css";
import { useEffect } from "react";
import SettingsInit from "../index/settingsInit";

const TrainsByName = () => {
  const { trainName } = useParams();

  const trainNums = Object.keys(trainNames)
    .filter((trainNum) => trainNames[trainNum] === trainName)
    .sort();

  const [trainNum, setTrainNum] = useState(trainNums[0]);
  const [trainLink, setTrainLink] = useState(`/trains/${trainNum}`);
  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);

  useEffect(() => {
    let finalData = [];
    fetch("https://api-v3.amtraker.com/v3/trains")
      .then((res) => res.json())
      .then((data) => {
        Object.keys(data).forEach((trainNum, i, arr) => {
          if (trainNums.includes(trainNum)) {
            finalData.push(trainNum);
          }

          if (i === arr.length - 1) setTrainData(finalData);
          setLoading(false);

          setTrainLink(`/trains/${finalData[0]}`);
        });
      });
  }, []);

  return (
    <>
      <img
        alt={"A slightly blurred version of a map of Amtrak's Network"}
        id='background'
        className='bg-focus-in'
        src='/content/images/amtraker-bg.webp'
      ></img>
      <main>
        <SettingsInit />
        <section className='section-new'>
          <div>
            <h3>Track the</h3>
            <h2>{trainName}</h2>
            {loading ? (
              <>
                <h4>Loading train data...</h4>
                <Link to={-1}>
                  <button
                    style={{
                      marginTop: "8px",
                    }}
                  >
                    Cancel
                  </button>
                </Link>
              </>
            ) : (
              <>
                {trainData.length === 0 ? (
                  <>
                    <h4>
                      There are no trains currently running with that name.
                    </h4>
                    <Link to={-1}>
                      <button
                        style={{
                          marginTop: "8px",
                        }}
                      >
                        Go Back
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h4>Choose your train number from the list:</h4>
                    <select
                      name='trainNum'
                      id='trainNum'
                      value={trainNum}
                      onChange={(e) => {
                        setTrainNum(e.target.value);
                        setTrainLink(`/trains/${e.target.value}`);
                      }}
                    >
                      {trainData.map((trainNum) => {
                        return (
                          <option
                            key={`train-selector-${trainNum}`}
                            value={trainNum}
                          >
                            {trainNum} - {trainName}
                          </option>
                        );
                      })}
                    </select>
                    <br />
                    <Link to={trainLink} replace={true}>
                      <button>Track Train</button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default TrainsByName;
