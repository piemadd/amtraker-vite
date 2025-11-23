import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { trainNames } from "../../data/trains";
import settingsInit from "../../components/settingsInit";
import "./trains.css"; //fuck it we ball
import stringToHash from "../../components/money/stringToHash";

const FullTrainsList = () => {
  const navigate = useNavigate();

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
        className={bgClass + ' terrabanner'}
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
        </div>
        <section className='section-trainPage'>
          <p>
            Below is a list of trains intended for crawling purposes by search
            engines and those who prefer to browse a long list of train names
            and numbers.
          </p>
          <br />
          <div
            style={{
              overflowY: "scroll",
              width: "100%",
              textAlign: "left",
            }}
          >
            <h2>Trains by Name</h2>
            {[...new Set(Object.values(trainNames))].map((trainName) => {
              return (
                <Link
                  to={`/trains/names/${trainName}`}
                  key={`train-name-${trainName}`}
                  style={{ textDecoration: "underline" }}
                >
                  <p>{trainName}</p>
                </Link>
              );
            })}
            <h2>Trains by Number</h2>
            {Object.keys(trainNames).map((trainNum) => {
              return (
                <Link
                  to={`/trains/${trainNum}`}
                  key={`train-number-${trainNum}`}
                  style={{ textDecoration: "underline" }}
                >
                  <p>
                    #{trainNum} - {trainNames[trainNum]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};

export default FullTrainsList;
