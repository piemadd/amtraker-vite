import { toHoursAndMinutesLate } from '../../tools';

const ManualStationBox = ({ station, train, loading = false }) => {
  const schArr = new Date(station.schArr ?? station.schDep ?? null);
  const arr = new Date(station.arr ?? station.dep ?? null);

  const schDep = new Date(station.schDep ?? station.schArr ?? null);
  const dep = new Date(station.dep ?? station.arr ?? null);

  let trainTimely = "On Time";

  if (schArr.valueOf() > arr.valueOf()) trainTimely = "Early";
  if (schArr.valueOf() < arr.valueOf()) trainTimely = "Late";
  if (!schArr || !arr) trainTimely = "No Data";

  let toUse = arr;
  if (train.origCode === station.code) toUse = dep;
  if (train.destCode !== station.code &&
    (station.status === "Departed" || station.status === "Station")) toUse = dep;

  return loading ? (
    <div className={"station-line"}>Loading train...</div>
  ) : (
    <div
      className={`station-line${train.eventCode === station.code ? " currentStation" : ""
        }`}
    >
      <div>
        <h3>
          {station.name} ({station.code})
        </h3>
      </div>
      <div>
        <p className='greyed'>
          {station.status === "Departed"
            ? "Dep"
            : station.status === "Enroute"
              ? "Est arr"
              : "Est dep"}
        </p>
        &nbsp;
        <p className='status-text' style={{
          color: station.stopIconColor != '#212529' ? station.stopIconColor : '#bbb',
        }}>
          {station.status === "Enroute"
            ? toHoursAndMinutesLate(arr, schArr)
            : toHoursAndMinutesLate(dep, schDep)}
        </p>
      </div>
      <div>
        <p className='enroute'>
          {new Intl.DateTimeFormat([], {
            hour: "numeric",
            minute: "numeric",
            timeZone: station.tz,
          }).format(toUse)}
        </p>
        &nbsp;
        <p className='greyed enroute'>
          {": "}
          {new Intl.DateTimeFormat([], {
            month: "short",
            day: "numeric",
            timeZone: station.tz,
          }).format(toUse)}
        </p>
      </div>
      {station.platform.length > 0 ? (
        <div>
          <p className='greyed'>
            Track {station.platform}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ManualStationBox;
