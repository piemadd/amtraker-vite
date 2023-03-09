import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import "../trains/trains.css"; //fuck it we ball
import ShortTrainIDTrainBox from "../../components/trainBox/shortTrainIDTrainBox";
import SettingsInit from "../index/settingsInit";

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

  return (
    <>
      <img
        id='background' alt='Amtrak network map.'
        className='bg-focus-in'
        src='/content/images/amtraker-bg.webp'
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
                {stationData.trains.length > 0 ? stationData.trains.map((trainID) => {
                  return (
                    <Link
                      to={`/trains/${trainID.split('-').join('/')}`}
                      key={`train-${trainID}`}
                      className='station-link'
                    >
                      <ShortTrainIDTrainBox trainID={trainID} />
                    </Link>
                  );
                }) : <div className='station-box'><p>No trains active for this station</p></div>}
              </>
            ) : (
              <div className='station-box'><p>Loading station data...</p></div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default StationPage;
