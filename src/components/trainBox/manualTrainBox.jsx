import "../../paths/trains/trains.css";

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

const ManualTrainBox = ({
  train,
  loading = false,
  maxWidth = false,
  width = null,
  onClick = null,
}) => {
  if (train.eventCode == "CBN") {
    const stationCodes = train.stations.map((station) => station.code);
    if (stationCodes.indexOf("NFS") < stationCodes.indexOf("NFL")) {
      train.eventCode = "NFL";
    } else {
      train.eventCode = "NFS";
    }
  }

  const currentStation = train.stations.find(
    (station) => station.code === train.eventCode
  );

  if (!currentStation) {
    console.log(train);
    return null;
  }

  const schArr = new Date(
    currentStation.schArr ?? currentStation.schDep ?? null
  );
  const arr = new Date(currentStation.arr ?? currentStation.dep ?? null);

  let trainTimely = "On Time";

  if (schArr.valueOf() > arr.valueOf()) trainTimely = "Early";
  if (schArr.valueOf() < arr.valueOf()) trainTimely = "Late";
  if (!schArr || !arr) trainTimely = "No Data";
  if (train.eventCode === train.destCode && currentStation.status !== "Enroute")
    trainTimely = "Complete";

  const trainTimelyClass = trainTimely.toLowerCase().split(" ").join("-");

  return loading ? (
    <div
      className={`train-box${maxWidth ? " train-box-max-width" : ""}`}
      style={{
        width: width ? width : "auto",
      }}
      onClick={onClick}
    >
      Loading train...
    </div>
  ) : (
    <div
      className={`train-box${maxWidth ? " train-box-max-width" : ""}`}
      onClick={onClick}
    >
      <div>
        <span className={`${trainTimelyClass} status`}>{train.trainNum}</span>{" "}
        {train.routeName}{" "}
        <span className={`${trainTimelyClass} status`}>{trainTimely}</span>
      </div>
      <p>
        {new Intl.DateTimeFormat([], {
          month: "short",
          day: "numeric",
        }).format(
          new Date(train.stations[0].dep ?? train.stations[0].schDep ?? null)
        )}{" "}
        - {train.origCode} to {train.destCode}
      </p>
      <p>
        {toHoursAndMinutesLate(arr, schArr)} - {train.velocity.toFixed(1)} mph
      </p>
      <p>
        Next: {train.eventName} ({train.eventCode})
      </p>
      {train.statusMsg === "SERVICE DISRUPTION" ? (
        <p>
          <b>Service Disruption</b>
        </p>
      ) : null}
    </div>
  );
};

export default ManualTrainBox;
