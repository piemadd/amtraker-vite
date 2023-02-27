import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { trainNames } from "../../data/trains";
import "./trains.css";
import SettingsInit from "../index/settingsInit";

const TrainsByNumber = () => {
  const { trainNum } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState("");
  const [trainLink, setTrainLink] = useState(`/trains/${trainNum}`);

  useEffect(() => {
    fetch(`https://api-v3.amtraker.com/v3/trains/${trainNum}`)
      .then((res) => res.json())
      .then((data) => {
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
          setTrainLink(
            `/trains/${trainNum}/${sorted[0].trainID.split("-")[1]}`
          );

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

  return (
    <>
      <img
        id='background'
        className='bg-focus-in'
        src='/content/images/amtraker-bg.webp'
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
