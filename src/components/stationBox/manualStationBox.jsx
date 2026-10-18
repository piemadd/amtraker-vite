import { toHoursAndMinutesLate } from '../../tools';
import { m } from "../../paraglide/messages.js";

const ManualStationBox = ({ station, train, loading = false }) => {
  const schArr = new Date(station.schArr ?? station.schDep ?? null);
  const arr = new Date(station.arr ?? station.dep ?? null);

  const schDep = new Date(station.schDep ?? station.schArr ?? null);
  const dep = new Date(station.dep ?? station.arr ?? null);

  let trainTimely = m["common_strings.train_status.on_time"]();

  if (schArr.valueOf() > arr.valueOf()) trainTimely = m["common_strings.train_status.early"]();
  if (schArr.valueOf() < arr.valueOf()) trainTimely = m["common_strings.train_status.late"]();
  if (!schArr || !arr) trainTimely = m["common_strings.train_status.no_data"]();


  let toUseTime = 0; // 0 is dep only, 1 is both, 2 is arr only
  if (train.destCode == station.code) toUseTime = 2; // the only use of arr only
  else if (train.origCode == station.code) toUseTime = 0;
  else if (arr.valueOf() != dep.valueOf() || station.status == "Station") toUseTime = 1;
  else toUseTime = 0;

  return loading ? (
    <div className={"station-line"}>{m["common_strings.loading_train"]()}...</div>
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
            {station.status === "Enroute" ? m["common_strings.time.est_arr"]() : m["common_strings.time.arr"]()}:
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
            {station.status === "Departed" ? m["common_strings.time.dep"]() : m["common_strings.time.est_dep"]()}:
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
            {m["common_strings.track_number"]({ platform: station.platform })}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ManualStationBox;
