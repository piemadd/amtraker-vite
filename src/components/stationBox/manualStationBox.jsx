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
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}min`;
  if (hours === 0) amount = `${Math.abs(minutes)}min`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;

  //on time
  if (diff === 0) return "On Time";

  //late or early
  return diff > 0 ? `${amount} Late` : `${amount} Early`;
};

const ManualStationBox = ({ station, train, loading = false }) => {
  const schArr = new Date(station.schArr ? station.schArr : station.schDep);
  const arr = new Date(station.arr ? station.arr : station.dep);

  const schDep = new Date(station.schDep ? station.schDep : station.schArr);
  const dep = new Date(station.dep ? station.dep : station.arr);

  let trainTimely = "On Time";

  if (schArr.valueOf() > arr.valueOf()) trainTimely = "Early";
  if (schArr.valueOf() < arr.valueOf()) trainTimely = "Late";
  if (!schArr || !arr) trainTimely = "No Data";

  const stationTimelyClass = trainTimely.toLowerCase().split(" ").join("-");

  return loading ? (
    <div className={"station-line"}>Loading train...</div>
  ) : (
    <div
      className={`station-line${
        train.eventCode === station.code ? " currentStation" : ""
      }`}
    >
      <div>
        <h3>
          {station.name} ({station.code})
        </h3>
      </div>
      <div>
        <p className='greyed'>
          {station.status === "Departed" ? "Dep" : "Est arr"}
        </p>
        &nbsp;
        <p className={`${stationTimelyClass}-text status-text`}>
          {toHoursAndMinutesLate(dep, schDep)}
        </p>
      </div>
      {train.origCode !== station.code && station.status === "Enroute" ? (
        <div>
          <p>
            {new Intl.DateTimeFormat([], {
              hour: "numeric",
              minute: "numeric",
              timeZone: station.tz,
            }).format(arr)}
            {" :"}
          </p>
          &nbsp;
          <p className='greyed'>
            {new Intl.DateTimeFormat([], {
              month: "short",
              day: "numeric",
              timeZone: station.tz,
            }).format(arr)}
          </p>
        </div>
      ) : null}
      {train.destCode !== station.code && station.status === "Departed" ? (
        <div>
          <p>
            {new Intl.DateTimeFormat([], {
              hour: "numeric",
              minute: "numeric",
              timeZone: station.tz,
            }).format(dep)}
          </p>
          &nbsp;
          <p className='greyed'>
            {": "}
            {new Intl.DateTimeFormat([], {
              month: "short",
              day: "numeric",
              timeZone: station.tz,
            }).format(dep)}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ManualStationBox;
