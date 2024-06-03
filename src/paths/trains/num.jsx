import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { trainNames } from "../../data/trains";
import "./trains.css";
import SettingsInit from "../index/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import DataManager from "../../components/dataManager/dataManager";

const TrainsByNumber = () => {
  const { trainNum } = useParams();
  const navigate = useNavigate();
  const dataManager = window.dataManager;

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState("");
  const [trainLink, setTrainLink] = useState(`/trains/${trainNum}`);

  useEffect(() => {
    dataManager.getTrain(trainNum).then((data) => {
      console.log("data fetched", data);
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

        setTrainData(sorted);
        setSelectedTrain(sorted[0].trainID);
        setTrainLink(`/trains/${trainNum}/${sorted[0].trainID.split("-")[1]}`);

        if (data[trainNum].length === 1) {
          console.log("only one train, navigating");
          navigate(
            `/trains/${trainNum}/${data[trainNum][0].trainID.split("-")[1]}`,
            {
              replace: true,
            }
          );
        }
      }
    });
  }, [trainNum, navigate]);

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
      <main>
        <SettingsInit />
        <section className='section-new'>
          {!loading ? (
            <div>
              {trainData.length > 0 ? (
                <>
                  <h3>Track the</h3>
                  <h2>{trainNames[trainNum]}</h2>
                  <h4>Choose your departure date from the list:</h4>
                  <select
                    name='trainNum'
                    id='trainNum'
                    value={selectedTrain}
                    onChange={(e) => {
                      setSelectedTrain(e.target.value);
                      setTrainLink(
                        `/trains/${trainNum}/${e.target.value.split("-")[1]}`
                      );
                    }}
                  >
                    {trainData.map((train) => {
                      return (
                        <option
                          key={`train-selector-${train.trainID}`}
                          value={train.trainID}
                        >
                          {new Intl.DateTimeFormat([], {
                            dateStyle: "medium",
                          }).format(new Date(train.stations[0].schDep))}
                        </option>
                      );
                    })}
                  </select>
                  <br />

                  <Link to={trainLink} replace={true}>
                    <button>Track Train</button>
                  </Link>
                </>
              ) : (
                <>
                  <h3>Track the</h3>
                  <h2>{trainNames[trainNum]}</h2>
                  <h4>
                    No trains with that number are currently tracking. Sorry :(
                  </h4>
                  <button
                    onClick={() => {
                      if (history.state.idx && history.state.idx > 0) {
                        navigate(-1);
                      } else {
                        navigate("/", { replace: true }); //fallback
                      }
                    }}
                  >
                    Go Back to Home
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              <h3>Loading...</h3>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default TrainsByNumber;
