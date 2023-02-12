import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../trains/trains.css"; //fuck it we ball
import Fuse from "fuse.js";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import SettingsInit from "../index/settingsInit";

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const TrainsList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");

  useEffect(() => {
    fetch("https://api-v3.amtraker.com/v3/trains")
      .then((res) => res.json())
      .then((data) => {
        console.log("data fetched", data);
        setTrainData(Object.values(data).flat());
        setResults(Object.values(data).flat());
        setLoading(false);
      });
  }, []);

  const fuse = new Fuse(trainData, {
    keys: ["routeName", "trainNum", "trainID", "stations.name", "stations.code", "stations.city", "stations.zip"],
    includeScore: true,
  });

  return (
    <>
      <img
        alt={"A slightly blurred version of a map of Amtrak's Network"}
        id='background'
        className='bg-focus-in'
        src='/content/images/amtraker-bg.webp'
      ></img>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
            className='click'
          >
            Back
          </h2>
        </div>
        <section className='section-trainPage'>
          <SettingsInit />
          <input
            id='searchbox'
            type='text'
            value={query}
            placeholder='Search for a train'
            onChange={(e) => {
              updateQuery(e.target.value);
              debounce(
                setResults(
                  e.target.value.length > 0
                    ? fuse.search(e.target.value).map((result) => result.item)
                    : trainData
                )
              );
            }}
          />
          <br />
          <div className='stations fullTrainsList'>
            {!loading ? (
              <>
                {results.map((train) => {
                  return (
                    <Link
                      to={`/trains/${train.trainID.replace('-', '/')}`}
                      key={`train-${train.trainID}`}
                      className='station-link'
                    >
                      <ManualTrainBox train={train} />
                    </Link>
                  );
                })}
              </>
            ) : (
              <div className='station-box'>
                <p>Loading train data...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default TrainsList;
