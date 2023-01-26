import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import ManualStationBox from "../../components/stationBox/manualStationBox";
import "./trains.css";

const TrainPage = () => {
  const { trainNum, trainDate } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);

  useEffect(() => {
    fetch(`https://api-v3.amtraker.com/v3/trains/${trainNum}-${trainDate}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data fetched", data);
        setLoading(false);
        if (Array.isArray(data) && Object.keys(data).length === 0) {
          console.log("is not valid");
        } else {
          console.log("is valid");
          setTrainData(data[trainNum]);

          // setting saved train
          if (!localStorage.getItem("savedTrainsAmtrakerV3")) {
            localStorage.setItem("savedTrainsAmtrakerV3", "");
          }

          const savedTrains = localStorage
            .getItem("savedTrainsAmtrakerV3")
            .split(",")
            .filter((n) => n);

          const savedTrain = savedTrains.find((element) => {
            return (
              element.split("-")[0] === trainNum &&
              element.split("-")[2] === trainDate
            );
          });

          if (savedTrain === undefined) {
            const departureDate = new Date(data[trainNum][0].stations[0].dep);
            localStorage.setItem(
              "savedTrainsAmtrakerV3",
              [
                ...savedTrains,
                `${trainNum}-${
                  departureDate.getMonth() + 1
                }-${trainDate}-${departureDate
                  .getFullYear()
                  .toString()
                  .substring(2, 4)}`,
              ].join(",")
            );
          }
        }
      });
  }, [trainNum, trainDate]);

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
          <h2
          className="click"
            onClick={() => {
              // removing saved train
              const savedTrains = localStorage
                .getItem("savedTrainsAmtrakerV3")
                .split(",")
                .filter((n) => n);

              localStorage.setItem(
                "savedTrainsAmtrakerV3",
                savedTrains
                  .filter((element) => {
                    return (
                      element.split("-")[0] !== trainNum &&
                      element.split("-")[2] !== trainDate
                    );
                  })
                  .join(",")
              );

              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
          >
            Delete Train
          </h2>
        </div>
        <section className='section-trainPage'>
          {!loading ? (
            <>
              {trainData.length > 0 ? (
                <>
                  <ManualTrainBox train={trainData[0]} />
                  <h2>Stations</h2>
                  <div className='stations'>
                    {trainData[0].stations.map((station, index) => {
                      return (
                        <Link
                          to={`/stations/${station.code}`}
                          key={`station-${station.code}`}
                          className='station-link'
                        >
                          <ManualStationBox
                            station={station}
                            train={trainData[0]}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p>
                    This train is not currently tracking. Please try again
                    later. We apologize for the inconvenience.
                  </p>
                  <button onClick={() => navigate(-1)}>Go Back</button>
                </>
              )}
            </>
          ) : (
            <p>Loading train...</p>
          )}
        </section>
      </div>
    </>
  );
};

export default TrainPage;
