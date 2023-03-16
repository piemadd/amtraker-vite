import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./trains.css"; //fuck it we ball
import Fuse from "fuse.js";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import SettingsInit from "../index/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import Banner from "../../components/money/terraBanner";

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
    keys: [
      "routeName",
      "trainNum",
      "trainID",
      "stations.name",
      "stations.code",
      "stations.city",
      "stations.zip",
    ],
    includeScore: true,
  });

  const [bgURL, setBGURL] = useState("/content/images/amtraker-bg.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
          "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
        hash ==
          "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
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
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
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
          <div className='stations fullTrainsList'>
            {!loading ? (
              <>
                {results.map((train, i) => {
                  if (i == 10) {
                    return (
                      <>
                        <Banner />
                        <Link
                          to={`/trains/${train.trainID.replace("-", "/")}`}
                          key={`train-${train.trainID}`}
                          replace={true}
                          className='station-link'
                        >
                          <ManualTrainBox train={train} />
                        </Link>
                      </>
                    );
                  } else {
                    return (
                      <Link
                        to={`/trains/${train.trainID.replace("-", "/")}`}
                        key={`train-${train.trainID}`}
                        replace={true}
                        className='station-link'
                      >
                        <ManualTrainBox train={train} />
                      </Link>
                    );
                  }
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
