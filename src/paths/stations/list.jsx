import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../trains/trains.css"; //fuck it we ball
import Fuse from "fuse.js";
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

const StationsList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState([]);
  const [results, setResults] = useState([]);
  const [query, updateQuery] = useState("");

  useEffect(() => {
    fetch("https://api-v3.amtraker.com/v3/stations")
      .then((res) => res.json())
      .then((data) => {
        console.log("data fetched", data);
        setStationData(
          Object.values(data).sort((a, b) => {
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
          <br />
          <div className='stations fullStationsList'>
            {!loading ? (
              <>
                {results.map((station) => {
                  if (!station.tz) {
                    console.log(station.name, station.code, station.state);
                  }
                  return (
                    <Link
                      to={`/stations/${station.code}`}
                      key={`station-${station.code}`}
                      className='station-link'
                    >
                      <div className='station-box'>
                        <div>
                          {station.name} ({station.code})&nbsp;
                        </div>
                        <p>
                          <span className='greyed'>
                            {station.address1}{" "}
                            {station.address2 !== " " ? station.address2 : null}
                            <br />
                            {station.city}, {station.state} {station.zip}
                            <br />
                            {station.tz}
                          </span>
                        </p>
                      </div>
                    </Link>
                  );
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
