const toHoursAndMinutesLate = (date1, date2) => {

  if (date1.toString() === "Invalid Date" || date2.toString() === "Invalid Date") return "Estimate Error";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Schedule Error";

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
    <div className={"station-box"}>Loading train...</div>
  ) : (
    <div
      className={`station-box${
        train.eventCode === station.code ? " currentStation" : ""
      }`}
    >
      <div>
        {station.name} ({station.code})&nbsp;
        <span className={`${stationTimelyClass} status`}>{trainTimely}</span>
      </div>
      <p>
        {arr.toString() !== "Invalid Date" ? new Intl.DateTimeFormat([], {
          month: "long",
          day: "numeric",
        }).format(arr) : 'Arrival Time Error'}{" "}
      </p>
      {station.status !== "Enroute" ? (
        <p>
          <span className='greyed'>Actual Arrival/Departure:</span>
        </p>
      ) : (
        <p>
          <span className='greyed'>Estimated Arrival/Departure:</span>
        </p>
      )}
      {train.origCode !== station.code ? (
        <p>
          <span className='greyed'>A:</span>{" "}
          {arr.toString() !== "Invalid Date" ? new Intl.DateTimeFormat([], {
            hour: "numeric",
            minute: "numeric",
            timeZone: station.tz,
            timeZoneName: "short",
          }).format(arr) : "Arrival Time Error"}{" "}
          {arr.valueOf() !== schArr.valueOf()
            ? `(${toHoursAndMinutesLate(arr, schArr)})`
            : null}
        </p>
      ) : null}
      {train.destCode !== station.code ? (
        <p>
          <span className='greyed'>D:</span>{" "}
          {new Intl.DateTimeFormat([], {
            hour: "numeric",
            minute: "numeric",
            timeZone: station.tz,
            timeZoneName: "short",
          }).format(dep)}{" "}
          {dep.valueOf() !== schDep.valueOf()
            ? `(${toHoursAndMinutesLate(dep, schDep)})`
            : null}
        </p>
      ) : (
        <p>&nbsp;</p>
      )}
      {train.origCode === station.code ? <p>&nbsp;</p> : null}
    </div>
  );
};

export default ManualStationBox;
