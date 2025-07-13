import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./trains.css"; //fuck it we ball
import ManualTrainBox from "../../components/trainBox/manualTrainBox";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import SenseBlock from "../../components/money/senseArticle";
import { toHoursAndMinutesLate } from "../../tools";

// calculateIconColor.ts in amtraker-v3

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
const componentToHex = (c) => {
  const trueValue = Math.min(Math.max(Math.floor(c * 255), 0), 255);
  var hex = trueValue.toString(16);
  return hex.padStart(2, '0');
};

// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
const hsvToRgb = (h, s, v, returnComponents = false) => {
  let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  if (returnComponents) return [f(5) * 255, f(3) * 255, f(1) * 255];
  return `#${componentToHex(f(5))}${componentToHex(f(3))}${componentToHex(f(1))}`;
};
const reinterprolateValue = (x, minX, maxX, minY, maxY) => (((x - minX) * (maxY - minY)) / (maxX - minX)) + minY;

const calculateColorInRange = (minutesLate, maxMinutesLate) => {
  const actualMinutesLate = Math.min(Math.max(minutesLate, 0), maxMinutesLate);

  const colorPercents = [
    {
      minutes: 0,
      hsv: [132, 0.69, 0.54]
    },
    {
      minutes: maxMinutesLate * 0.25,
      hsv: [35, 0.93, 0.78]
    },
    {
      minutes: maxMinutesLate,
      hsv: [-12, 0.94, 0.78]
    }
  ];

  let lowPointIndex = 0;
  let highPointIndex = colorPercents.length - 1;

  for (let i = 0; i < colorPercents.length; i++) {
    const point = colorPercents[i];

    if (point.minutes < minutesLate) lowPointIndex = i;
    if (point.minutes >= minutesLate) {
      highPointIndex = i;
      break;
    }

    if (i == colorPercents.length - 1) highPointIndex = i; // has to be the high point
  };

  const lowPoint = colorPercents[lowPointIndex];
  const highPoint = colorPercents[highPointIndex];

  if (lowPoint.minutes == highPoint.minutes) return {
    color: hsvToRgb(lowPoint.hsv[0], lowPoint.hsv[1], lowPoint.hsv[2]),
    text: "#ffffff"
  }

  let actualHue = reinterprolateValue(actualMinutesLate, lowPoint.minutes, highPoint.minutes, lowPoint.hsv[0], highPoint.hsv[0]);
  let actualSaturation = reinterprolateValue(actualMinutesLate, lowPoint.minutes, highPoint.minutes, lowPoint.hsv[1], highPoint.hsv[1]);
  let actualValue = reinterprolateValue(actualMinutesLate, lowPoint.minutes, highPoint.minutes, lowPoint.hsv[2], highPoint.hsv[2]);

  // fallback
  // NaN really only appears at the if above, but im not trying to be too careful
  if (
    isNaN(actualHue) ||
    isNaN(actualSaturation) ||
    isNaN(actualValue)
  ) return {
    color: hsvToRgb(lowPoint.hsv[0], lowPoint.hsv[1], lowPoint.hsv[2]),
    text: "#ffffff"
  }

  if (actualHue < 0) actualHue += 360;

  const rgbComponents = hsvToRgb(actualHue, actualSaturation, actualValue, true);
  const greyscaleValue = (rgbComponents[0] * 0.299) + (rgbComponents[1] * 0.587) + (rgbComponents[1] * 0.114);

  return {
    color: hsvToRgb(actualHue, actualSaturation, actualValue),
    text: greyscaleValue > 145 ? "#000000" : "#ffffff",
  }
};
// end calculateIconColor.ts in amtraker-v3

const providerColors = {
  'Via': '#FFDB00',
  'Brightline': 'FFCC00',
  'Amtrak': '#18567D',
};

const providerTextColors = {
  'Via': '#000000',
  'Brightline': '#000000',
  'Amtrak': '#FFFFFF',
};

const TrainsLeaderboard = () => {
  const navigate = useNavigate();
  const dataManager = window.dataManager;
  const appSettings = useMemo(settingsInit, []);

  const [loading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [shitsFucked, setShitsFucked] = useState(false);

  useEffect(() => {
    dataManager.getTrains()
      .then((data) => {
        const allDataNew = Object.values(data).flat();

        setTrainData(allDataNew);

        if (Object.keys(data).length === 0) {
          setShitsFucked(true);
        }

        setLoading(false);
      });
  }, []);

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
          <div className='trainsLeaderboard'>
            <div className="leaderboardTitle">Rank</div>
            <div className="leaderboardTitle">Name</div>
            <div className="leaderboardTitle">Railroad</div>
            <div className="leaderboardTitle">HH:MM Late</div>
            {!loading ? (
              <>
                {trainData
                  .map((train) => {
                    const currentStop = train.stations.find((station) => train.eventCode == station.code);
                    let msLate = new Date(currentStop.arr ?? currentStop.dep).valueOf() - new Date(currentStop.schArr ?? currentStop.schDep).valueOf();

                    if (!msLate) msLate = 0;

                    return {
                      ...train,
                      currentStop,
                      msLate
                    }
                  })
                  .sort((a, b) => {
                    console.log(a.msLate, b.msLate, b.msLate - a.msLate)
                    return b.msLate - a.msLate
                  })
                  .map((train, i, arr) => {

                    //console.log(train)

                    const posColor = calculateColorInRange((arr.length - i) / 2, arr.length)

                    return <>
                      <div
                        className="leaderboardElement"
                        style={{
                          backgroundColor: posColor.color,
                          color: posColor.text,
                        }}>{i + 1}</div>
                      <div className="leaderboardElement">{train.routeName} [{train.trainNumRaw}] {!train.onlyOfTrainNum ? `(${train.trainID.split('-')[1]})` : ""}</div>
                      <div
                        className="leaderboardElement"
                        style={{
                          backgroundColor: providerColors[train.provider],
                          color: providerTextColors[train.provider],
                        }}>{train.provider}</div>
                      <div
                        className="leaderboardElement"
                        style={{
                          backgroundColor: train.iconColor,
                          color: train.textColor,
                        }}>{toHoursAndMinutesLate(new Date(train.currentStop.arr ?? train.currentStop.dep), new Date(train.currentStop.schArr ?? train.currentStop.schDep))}</div>
                    </>

                    return (<Link
                      to={`/trains/${train.trainID.replace("-", "/")}`}
                      key={`train-${train.trainID}`}
                      replace={true}
                      className='station-link'
                    >
                      <ManualTrainBox train={train} />
                    </Link>)
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

export default TrainsLeaderboard;
