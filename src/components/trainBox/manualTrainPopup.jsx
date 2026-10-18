import { toHoursAndMinutesLate } from "../../tools";
import { m } from "../../paraglide/messages.js";

const ManualTrainPopup = ({ train, showLink = true, idLink = false }) => {
  if (!train) return null;

  const currentStation = train.stations.find(
    (station) => station.code === train.eventCode
  );

  return <div className='train-popup'>
    <div className='train-popup__header' style={{
      paddingRight: '16px'
    }}>{train.routeName}</div>
    {train.statusMsg === "SERVICE DISRUPTION" ? (
      <div className='train-popup__header'>{m["common_strings.service_disruption"]()}</div>
    ) : null}
    <div className='train-popup__info train-popup__updated greyed'>
      {m["common_strings.origin_to_destination"]({ origin: train.origCode, destination: train.destCode })}
    </div>
    <div className='train-popup__info train-popup__updated greyed'>
      {m["common_strings.speed_mph"]({ speed: train.velocity.toFixed(2) })} {train.heading}
    </div>
    <div className='train-popup__info train-popup__updated greyed'>
      {m["components.train_popup.updated"]()}{" "}
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
      {m["components.train_popup.to_station"]({ code: currentStation.code })}
    </div>
    <div className='train-popup__info train-popup__updated greyed'>
      {m["components.train_popup.estimated"]()} {new Date(
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
          //href={!idLink ? `#redirect_to:/trains/${train.trainID.split("-").join("/")}` : `#${train.trainID}`}
          onClick={((e) => {
            e.preventDefault();

            window.location.href = !idLink ? `#redirect_to:/trains/${train.trainID.split("-").join("/")}` : `#${train.trainID}`;

            console.log('done')
          })}
        >{!idLink ? m["components.train_popup.view_more"]() : m["components.train_popup.scroll_to_train"]()}</a>
      </div>
      : null}
  </div>
};

export default ManualTrainPopup;
