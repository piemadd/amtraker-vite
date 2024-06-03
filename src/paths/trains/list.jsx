import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import "./trains.css"; //fuck it we ball
import Fuse from "fuse.js";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import SettingsInit from "../index/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import SenseBlock from "../../components/money/senseArticle";

//import ErrorData from "../../data/error.json";

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
  const dataManager = window.dataManager;

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");
  const [shitsFucked, setShitsFucked] = useState(false);

  useEffect(() => {
    dataManager.getTrains()
      .then((data) => {
        console.log("data fetched", data);
        setTrainData(Object.values(data).flat());
        setResults(Object.values(data).flat());

        if (Object.keys(data).length === 0) {
          setShitsFucked(true);
        }

        //setTrainData(Object.values(ErrorData).flat());
        //setResults(Object.values(ErrorData).flat());

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
          {shitsFucked ? (
            <>
              <p>
                The Amtrak API seems to be having issues currently! Please try
                again later...
              </p>
              <h2></h2>
            </>
          ) : null}
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
                  if (i % 10 === 0 && i !== 0) {
                    return (
                      <div key={`with-terra-banner-${i}`}>
                        <SenseBlock
                          key={`sense-list-${i}`}
                          dataAdSlot={"2090024099"}
                        />
                        <Link
                          to={`/trains/${train.trainID.replace("-", "/")}`}
                          key={`train-${train.trainID}`}
                          replace={true}
                          className='station-link'
                        >
                          <ManualTrainBox train={train} />
                        </Link>
                      </div>
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
