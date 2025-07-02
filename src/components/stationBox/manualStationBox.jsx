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


  let toUseTime = 0; // 0 is dep only, 1 is both, 2 is arr only
  if (train.destCode == station.code) toUseTime = 2; // the only use of arr only
  else if (train.origCode == station.code) toUseTime = 0;
  else if (arr.valueOf() != dep.valueOf() || station.status == "Station") toUseTime = 1;
  else toUseTime = 0;

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
        <p className='status-text' style={{
          color: station.stopIconColor != '#212529' ? station.stopIconColor : '#bbb',
        }}>
          {station.status === "Enroute"
            ? toHoursAndMinutesLate(arr, schArr)
            : toHoursAndMinutesLate(dep, schDep)}
        </p>
        &nbsp;
        <p className='greyed'>
          {": "}
          {new Intl.DateTimeFormat([], {
            month: "short",
            day: "numeric",
            timeZone: station.tz,
          }).format(toUseTime <= 2 ? dep : arr)}
        </p>
      </div>
      {toUseTime >= 1 ? (
        <div>
          <p className='greyed'>
            {station.status === "Enroute" ? "Est arr" : "Arr"}:
          </p>
          &nbsp;
          <p className=''>
            {new Intl.DateTimeFormat([], {
              hour: "numeric",
              minute: "numeric",
              timeZone: station.tz,
            }).format(arr)}
          </p>
        </div>
      ) : null}
      {toUseTime <= 1 ? (
        <div>
          <p className='greyed'>
            {station.status === "Departed" ? "Dep" : "Est Dep"}:
          </p>
          &nbsp;
          <p className=''>
            {new Intl.DateTimeFormat([], {
              hour: "numeric",
              minute: "numeric",
              timeZone: station.tz,
            }).format(dep)}
          </p>
        </div>
      ) : null}
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
