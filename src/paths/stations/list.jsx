import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "../trains/trains.css"; //fuck it we ball
import Fuse from "fuse.js";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import SenseBlock from "../../components/money/senseArticle";
import DataManager from "../../components/dataManager/dataManager";

const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

const StationsList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState([]);
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");
  const [shitsFucked, setShitsFucked] = useState(false);

  const dataManger = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  useEffect(() => {
    dataManger.getStations().then((data) => {
      if (Object.keys(data).length === 0) {
        setShitsFucked(true);
      }

      setStationData(
        Object.values(data)
          .map((n) => {
            if (!n.name) {
              console.log("no name", n.code, n.city, n.state);
              n.name = n.city;
            }
            return n;
          })
          .sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
      );
      setResults(
        Object.values(data).sort((a, b) => {
          return a.name.localeCompare(b.name);
        })
      );
      setLoading(false);
    });
  }, []);

  const fuse = new Fuse(stationData, {
    keys: ["name", "code", "city", "zip"],
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
            style={{ paddingLeft: '32px' }}
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
          <input
            id='searchbox'
            type='text'
            value={query}
            placeholder='Search for a station'
            onChange={(e) => {
              updateQuery(e.target.value);
              debounce(
                setResults(
                  e.target.value.length > 0
                    ? fuse.search(e.target.value).map((result) => result.item)
                    : stationData
                )
              );
            }}
          />
          <div className='stations fullStationsList'>
            {!loading ? (
              <>
                {results.map((station, i) => {
                  if (!station.tz) {
                    console.log(
                      "no tz:",
                      station.name,
                      station.code,
                      station.state
                    );
                  }
                  if (!station.name) {
                    console.log("no name:", station.code, station.state);
                  }

                  if (i % 10 === 0 && i !== 0) {
                    return (
                      <>
                        <SenseBlock
                          key={`sense-list-${i}`}
                          dataAdSlot={"2090024099"}
                        />
                        <Link
                          to={`/stations/${station.code}`}
                          key={`station-${station.code}`}
                          replace={true}
                          className='station-link'
                        >
                          <div className='station-box'>
                            <div>
                              {station.name} ({station.code})&nbsp;
                            </div>
                            <p>
                              {station.hasAddress ? (
                                <span className='greyed'>
                                  {station.address1}{" "}
                                  {station.address2 !== " "
                                    ? station.address2
                                    : null}
                                  <br />
                                  {station.city}, {station.state} {station.zip}
                                  <br />
                                  {station.tz}
                                </span>
                              ) : (
                                <span className='greyed'>
                                  Address not available.
                                  <br />
                                  {station.tz}
                                </span>
                              )}
                            </p>
                          </div>
                        </Link>
                      </>
                    );
                  } else {
                    return (
                      <Link
                        to={`/stations/${station.code}`}
                        key={`station-${station.code}`}
                        replace={true}
                        className='station-link'
                      >
                        <div className='station-box'>
                          <div>
                            {station.name} ({station.code})&nbsp;
                          </div>
                          <p>
                            {station.hasAddress ? (
                              <span className='greyed'>
                                {station.address1}{" "}
                                {station.address2 !== " "
                                  ? station.address2
                                  : null}
                                <br />
                                {station.city}, {station.state} {station.zip}
                                <br />
                                {station.tz}
                              </span>
                            ) : (
                              <span className='greyed'>
                                Address not available.
                                <br />
                                {station.tz}
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  }
                })}
              </>
            ) : (
              <div className='station-box'>
                <p>Loading station data...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default StationsList;
