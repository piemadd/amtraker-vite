import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import stringToHash from "../../components/money/stringToHash";

import "../trains/trains.css"; //fuck it we ball
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import ShortTrainIDTrainBox from "../../components/trainBox/shortTrainIDTrainBox";
import settingsInit from "../../components/settingsInit";
import ShareButton from "../../components/buttons/shareButton";

const StationPage = () => {
  const { stationCode } = useParams();
  const navigate = useNavigate();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);
  const lastPage = useMemo(() => new URL(document.URL).searchParams.get('from'), []);

  const [loading, setLoading] = useState(true);
  const [stationData, setStationData] = useState([]);
  const [onlyShowUpcoming, setOnlyShowUpcoming] = useState(false);

  useEffect(() => {
    dataManager.getStation(stationCode).then((data) => {
      setStationData(data[stationCode]);
      setLoading(false);
    });
  }, [stationCode]);

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
              if ((history.state.idx && history.state.idx > 0) || lastPage) {
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
          <div className="multiButtonHolder">
              <ShareButton navigatorOptions={{
                title: `Track trains at ${stationData.name} (${stationData.code} with Amtraker!`,
                url: `https://amtraker.com/stations/${stationData.code}`,
              }} />
            </div>
        </div>
        <section className='section-trainPage'>
          <div className='station-box'>
            <div>
              {stationData.name} ({stationData.code})&nbsp;
            </div>
            <p>
              {stationData.hasAddress ? (
                <span className='greyed'>
                  {stationData.address1}{" "}
                  {stationData.address2 !== " " ? stationData.address2 : null}
                  <br />
                  {stationData.city}, {stationData.state} {stationData.zip}
                  <br />
                  {stationData.tz}
                </span>
              ) : (
                <span className='greyed'>
                  Address not available.
                  <br />
                  {stationData.tz}
                </span>
              )}
            </p>
          </div>
          <h2 style={{marginTop: '0px'}}>Trains</h2>
          <div
                  className="train-box train-box-max-width"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '1.5rem',
                    fontWeight: '300',
                    width: 'calc(100% - 26px)',
                    maxWidth: '380px'
                  }}>
                  <input type="checkbox" onChange={(e) => {
                    console.log(e.target.checked)
                    setOnlyShowUpcoming(e.target.checked)
                  }}/>
                  <label><b>Only Show Upcoming</b></label>
                </div>
          <div className='stations fullStationsList'>
            {!loading ? (
              <>
                {stationData.trains.length > 0 ? (
                  stationData.trains.map((trainID) => dataManager.getTrainSync(trainID, true))
                    .filter((train) => {
                      if (onlyShowUpcoming) {
                        const trainThisStation = train.stations.find((station) => station.code == stationCode);

                        if (!trainThisStation) return true; // still include, but it will be sorted downwards later

                        if (trainThisStation.status != "Enroute") return false;
                      }

                      return true;
                    })
                    .sort((trainA, trainB) => {
                      if (onlyShowUpcoming) {
                        // getting the stations
                        const trainAThisStation = trainA.stations.find((station) => station.code == stationCode);
                        const trainBThisStation = trainB.stations.find((station) => station.code == stationCode);

                        // managing edge cases
                        if (!trainAThisStation && !trainBThisStation) return trainB.trainID - trainA.trainID; // by train ID
                        if (!trainAThisStation) return 1; // prioritize B
                        if (!trainBThisStation) return -1; // prioritize A

                        //getting time stamps
                        const trainAThisStationTime = new Date(trainAThisStation.arr ?? trainAThisStation.dep);
                        const trainBThisStationTime = new Date(trainBThisStation.arr ?? trainBThisStation.dep);

                        // more edge cases
                        if (!trainAThisStationTime && !trainBThisStationTime) return trainB.trainID - trainA.trainID; // by train ID
                        if (!trainAThisStationTime) return 1; // prioritize B
                        if (!trainBThisStationTime) return -1; // prioritize A

                        return trainAThisStationTime.valueOf() - trainBThisStationTime.valueOf();
                      }

                      return trainB.trainID - trainA.trainID;
                    })
                    .map((train) => {
                      return (
                        <Link
                          to={`/trains/${train.trainID.split("-").join("/")}`}
                          key={`train-${train.trainID}`}
                          className='station-link'
                          style={{
                            width: 'calc(100% - 26px)'
                          }}
                        >
                          <ManualTrainBox
                            train={train}
                            maxWidth={true}
                            overrideEventCode={stationCode}
                          />
                        </Link>
                      );
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