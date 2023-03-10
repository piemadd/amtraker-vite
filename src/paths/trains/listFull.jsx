import { useNavigate, Link } from "react-router-dom";
import { trainNames } from "../../data/trains";
import SettingsInit from "../index/settingsInit";
import "./trains.css"; //fuck it we ball

const FullTrainsList = () => {
  const navigate = useNavigate();

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
          <SettingsInit />
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
