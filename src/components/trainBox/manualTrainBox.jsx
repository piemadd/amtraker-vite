import "../../paths/trains/trains.css";
import { toHoursAndMinutesLate } from "../../tools";
import { m } from "../../paraglide/messages.js";
import { useUnits, formatSpeed } from "../units.js";
import { getIntlLocale } from "../intlLocale.js";

const ManualTrainBox = ({
  train,
  loading = false,
  maxWidth = false,
  width = null,
  onClick = null,
  overrideEventCode = null,
  id = null,
  includeNextStopTime = false,
}) => {
  const units = useUnits();

  if (overrideEventCode) {
    train.eventCode = overrideEventCode;
  }

  if (train.eventCode == "CBN") {
    const stationCodes = train.stations.map((station) => station.code);
    if (stationCodes.indexOf("NFS") < stationCodes.indexOf("NFL")) {
      train.eventCode = "NFL";
    } else {
      train.eventCode = "NFS";
    }
  }

  const currentStation = train.stations?.find(
    (station) => station.code === train.eventCode,
  );

  if (!currentStation) {
    return null;
  }

  const schArr = new Date(
    currentStation.schArr ?? currentStation.schDep ?? null,
  );
  const arr = new Date(currentStation.arr ?? currentStation.dep ?? null);

  let trainTimely = m["common_strings.train_status.on_time"]();

  if (schArr.valueOf() > arr.valueOf()) trainTimely = m["common_strings.train_status.early"]();
  if (schArr.valueOf() < arr.valueOf()) trainTimely = m["common_strings.train_status.late"]();
  if (!schArr || !arr) trainTimely = m["common_strings.train_status.no_data"]();
  if (train.eventCode === train.destCode && currentStation.status !== "Enroute")
    trainTimely = m["common_strings.train_status.complete"]();

  return loading ? (
    <div
      className={`train-box${maxWidth ? " train-box-max-width" : ""}`}
      style={{
        width: width ? width : "auto",
      }}
      onClick={onClick}
    >
      {m["common_strings.loading_train"]()}...
    </div>
  ) : (
    <div
      className={`train-box${maxWidth ? " train-box-max-width" : ""}`}
      onClick={onClick}
    >
      <div>
        <span
          className="status"
          style={{
            backgroundColor: train.iconColor,
            textWrap: "nowrap",
          }}
        >
          {train.trainNum}
          {!train.onlyOfTrainNum ? ` (${train.trainID.split("-")[1]})` : ""}
        </span>
        &nbsp;
        <span>{train.routeName}</span>
        {overrideEventCode ? null : (
          <>
            &nbsp;
            <span
              className="status"
              style={{
                backgroundColor: train.iconColor,
                textWrap: "nowrap",
              }}
            >
              {trainTimely}
            </span>
          </>
        )}
      </div>
      <p>
        {m["common_strings.origin_to_destination"]({ origin: train.origCode, destination: train.destCode })}
      </p>
      <p>
        {toHoursAndMinutesLate(arr, schArr)} - {formatSpeed(train.velocity, 1, units)}
      </p>
      {overrideEventCode ? (
        <>
          <p>
            <b>{m["components.train_box.eta"]({ code: currentStation.code })}</b>{" "}
            {new Intl.DateTimeFormat(getIntlLocale(), {
              hour: "numeric",
              minute: "numeric",
              timeZone: currentStation.tz,
            }).format(arr)}
            &nbsp;:&nbsp;
            {new Intl.DateTimeFormat(getIntlLocale(), {
              month: "short",
              day: "numeric",
              timeZone: currentStation.tz,
            }).format(arr)}
          </p>
          {currentStation.platform.length > 0 ? (
            <p>[{m["common_strings.track_number"]({ platform: currentStation.platform })}]</p>
          ) : null}
        </>
      ) : (
        <p>
          {m["components.train_box.next_stop"]({ name: train.eventName, code: train.eventCode })}
          {currentStation.platform.length > 0
            ? ` [${m["common_strings.track_number"]({ platform: currentStation.platform })}]`
            : null}
        </p>
      )}
      {includeNextStopTime ? (
        <div style={{
          marginTop: -4,
          marginBottom: -4,
        }}>
          <p className='greyed'>
            {currentStation.status === "Departed" ? m["common_strings.time.dep"]() : m["common_strings.time.est_dep"]()}:
          </p>
          <p className=''>
            {new Intl.DateTimeFormat(getIntlLocale(), {
              hour: "numeric",
              minute: "numeric",
              timeZone: currentStation.tz,
            }).format(new Date(currentStation.dep))}
          </p>
        </div>
      ) : null}
      {train.statusMsg === "SERVICE DISRUPTION" ? (
        <p>
          <b>{m["common_strings.service_disruption"]()}</b>
        </p>
      ) : null}
    </div>
  );
};

export default ManualTrainBox;
