import { toHoursAndMinutesLate } from "../../tools";

const ManualTrainPopup = ({ train, showLink = true, idLink = false}) => {
  if (!train) return null;

  const currentStation = train.stations.find(
    (station) => station.code === train.eventCode
  );

  return <div className='train-popup'>
    <div className='train-popup__header' style={{
      paddingRight: '16px'
    }}>{train.routeName}</div>
    {train.statusMsg === "SERVICE DISRUPTION" ? (
      <div className='train-popup__header'>Service Disruption</div>
    ) : null}
    <div className='train-popup__info train-popup__updated greyed'>
      {train.origCode} to {train.destCode}
    </div>
    <div className='train-popup__info train-popup__updated greyed'>
      {train.velocity.toFixed(2)} mph {train.heading}
    </div>
    <div className='train-popup__info train-popup__updated greyed'>
      Updated:{" "}
      {new Intl.DateTimeFormat([], {
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
        timeZone: train.eventTZ,
      }).format(new Date(train.lastValTS))}
    </div>
    <div className='train-popup__info'>
      <span className='status-text' style={{
        color: currentStation.stopIconColor != '#212529' ? currentStation.stopIconColor : '#bbb',
      }}>
        {currentStation.status === "Enroute"
          ? toHoursAndMinutesLate(new Date(currentStation.arr), new Date(currentStation.schArr))
          : toHoursAndMinutesLate(new Date(currentStation.dep), new Date(currentStation.schDep))}
      </span>{" "}
      to {currentStation.code}
    </div>
    <div className='train-popup__info train-popup__updated greyed'>
      Estimated: {new Date(
        currentStation.arr ?? currentStation.dep ?? null
      ).toLocaleTimeString([], {
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short",
        timeZone: currentStation.tz
      })}
    </div>
    {showLink ?
      <div className='train-popup__info'>
        <a
        href={!idLink ? `#redirect_to:/trains/${train.trainID.split("-").join("/")}` : `#${train.trainID}`}
        onClick={((e) => {
          e.preventDefault();
        })}
        >{!idLink ? 'View More' : 'Scroll to Train'}</a>
      </div>
      : null}
  </div>
};

export default ManualTrainPopup;
