import "../../paths/trains/trains.css";
import { toHoursAndMinutesLate } from "../../tools";

const ManualTrainBox = ({
  train,
  loading = false,
  maxWidth = false,
  width = null,
  onClick = null,
  overrideEventCode = null
}) => {
  if (overrideEventCode) {
    train.eventCode = overrideEventCode
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
    (station) => station.code === train.eventCode
  );

  if (!currentStation) {
    return null;
  }

  const schArr = new Date(currentStation.schArr ?? currentStation.schDep ?? null);
  const arr = new Date(currentStation.arr ?? currentStation.dep ?? null);

  let trainTimely = "On Time";

  if (schArr.valueOf() > arr.valueOf()) trainTimely = "Early";
  if (schArr.valueOf() < arr.valueOf()) trainTimely = "Late";
  if (!schArr || !arr) trainTimely = "No Data";
  if (train.eventCode === train.destCode && currentStation.status !== "Enroute")
    trainTimely = "Complete";

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
        <span
          className='status'
          style={{
            backgroundColor: train.iconColor,
            textWrap: 'nowrap',
          }}
        >{train.trainNum}{!train.onlyOfTrainNum ? ` (${train.trainID.split('-')[1]})` : ''}</span>&nbsp;
        {train.routeName}
        {
          overrideEventCode ? null :
            <>
              &nbsp;
              <span
                className="status"
                style={{
                  backgroundColor: train.iconColor,
                  textWrap: 'nowrap',
                }}
              >{trainTimely}</span>
            </>
        }
      </div>
      <p>{train.origCode} to {train.destCode}</p>
      <p>
        {toHoursAndMinutesLate(arr, schArr)} - {train.velocity.toFixed(1)} mph
      </p>
      {
        overrideEventCode ?
          <>
            <p><b>{currentStation.code} ETA:</b> {new Intl.DateTimeFormat([], {
              hour: "numeric",
              minute: "numeric",
              timeZone: currentStation.tz,
            }).format(arr)}&nbsp;:&nbsp;
              {new Intl.DateTimeFormat([], {
                month: "short",
                day: "numeric",
                timeZone: currentStation.tz,
              }).format(arr)}
            </p>
            {currentStation.platform.length > 0 ? <p>[Track {currentStation.platform}]</p> : null}
          </>
          : <p>
            Next: {train.eventName} ({train.eventCode}){currentStation.platform.length > 0 ? ` [Track ${currentStation.platform}]` : null}
          </p>
      }
      {train.statusMsg === "SERVICE DISRUPTION" ? (
        <p>
          <b>Service Disruption</b>
        </p>
      ) : null}
    </div>
  );
};

export default ManualTrainBox;
