import { Link } from "react-router-dom";

const toHoursAndMinutesLate = (date1, date2) => {
  if (
    date1.toString() === "Invalid Date" ||
    date2.toString() === "Invalid Date"
  )
    return "Unknown (Estimate Error)";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Unknown (Schedule Error)";

  const hours = Math.floor(Math.abs(diff) / 1000 / 60 / 60);
  const minutes = Math.floor((Math.abs(diff) / 1000 / 60 / 60 - hours) * 60);

  // creating the text
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}m`;
  if (hours === 0) amount = `${Math.abs(minutes)}m`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;

  //on time
  if (diff === 0) return "On Time";

  //late or early
  return diff > 0 ? `${amount} late` : `${amount} early`;
};

const colorizedToHoursAndMinutesLate = (date1, date2) => {
  const res = toHoursAndMinutesLate(date1, date2);

  if (res === "Estimate Error") return <span className='late-text'>{res}</span>;
  if (res === "Schedule Error") return <span className='late-text'>{res}</span>;
  if (res === "On Time") return <span className='on-time-text'>{res}</span>;
  if (res.includes("late")) return <span className='late-text'>{res}</span>;
  if (res.includes("early")) return <span className='early-text'>{res}</span>;

  return <span className='error'>{res}</span>;
};

const fullDirections = {
  N: "North",
  S: "South",
  E: "East",
  W: "West",
  NE: "Northeast",
  NW: "Northwest",
  SE: "Southeast",
  SW: "Southwest",
};

const ManualTrainPopup = ({ train, loading = false }) => {
  const currentStation = train.stations.find(
    (station) => station.code === train.eventCode
  );

  return loading ? (
    <div>Loading train...</div>
  ) : (
    <div className='train-popup'>
      <div className='train-popup__header'>{train.routeName}</div>
      <div className='train-popup__header'>
        {train.statusMsg === "SERVICE DISRUPTION" ? "Service Disruption" : null}
      </div>
      <div className='train-popup__info greyed'>
        {train.origCode} to {train.destCode}
      </div>
      {/*
      <div className='train-popup__info greyed'>
        {new Intl.DateTimeFormat([], {
          month: "short",
          day: "numeric",
          timeZone: train.stations[0].tz,
        }).format(new Date(train.stations[0].dep))}{" "}
        : Train {train.trainNum}
      </div>
      */}

      <div className='train-popup__info greyed'>
        {train.velocity.toFixed(2)} mph {train.heading}
      </div>
      <div className='train-popup__info'>
        {colorizedToHoursAndMinutesLate(
          new Date(
            currentStation.arr ? currentStation.arr : currentStation.dep
          ),
          new Date(
            currentStation.schArr
              ? currentStation.schArr
              : currentStation.schDep
          )
        )}{" "}
        to {currentStation.code}
      </div>
      <div className='train-popup__info'>
        <Link to={`/trains/${train.trainID.split("-").join("/")}`}>
          View More
        </Link>
      </div>
    </div>
  );
};

export default ManualTrainPopup;
