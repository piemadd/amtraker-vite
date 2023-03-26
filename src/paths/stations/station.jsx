import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import stringToHash from "../../components/money/stringToHash";

import "../trains/trains.css"; //fuck it we ball
import ShortTrainIDTrainBox from "../../components/trainBox/shortTrainIDTrainBox";
import SettingsInit from "../index/settingsInit";
import SenseList from "../../components/money/senseList";

const StationPage = () => {
  const { stationCode } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState([]);

  useEffect(() => {
    fetch(`https://api-v3.amtraker.com/v3/stations/${stationCode}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data fetched", data);
        setStationData(data[stationCode]);
        setLoading(false);
      });
  }, [stationCode]);

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
          <div className='station-box'>
            <div>
              {stationData.name} ({stationData.code})&nbsp;
            </div>
            <p>
              <span className='greyed'>
                {stationData.address1}{" "}
                {stationData.address2 !== " " ? stationData.address2 : null}
                <br />
                {stationData.city}, {stationData.state} {stationData.zip}
                <br />
                {stationData.tz}
              </span>
            </p>
          </div>
          <h2>Trains</h2>
          <div className='stations fullStationsList'>
            <SettingsInit />
            {!loading ? (
              <>
                {stationData.trains.length > 0 ? (
                  stationData.trains.map((trainID, i, arr) => {
                    console.log("train index", i);
                    if (
                      (i % 10 === 0 ||
                        (i == arr.length - 1 && arr.length < 10)) &&
                      i !== 0
                    ) {
                      return (
                        <div key={`with-terra-banner-${i}`}>
                          <Link
                            to={`/trains/${trainID.split("-").join("/")}`}
                            key={`train-${trainID}`}
                            className='station-link'
                          >
                            <ShortTrainIDTrainBox trainID={trainID} />
                          </Link>
                          <SenseList
                            key={`sense-list-${i}`}
                            dataAdSlot={"6510210014"}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <Link
                          to={`/trains/${trainID.split("-").join("/")}`}
                          key={`train-${trainID}`}
                          className='station-link'
                        >
                          <ShortTrainIDTrainBox trainID={trainID} />
                        </Link>
                      );
                    }
                  })
                ) : (
                  <div className='station-box'>
                    <p>No trains active for this station</p>
                  </div>
                )}
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

export default StationPage;
