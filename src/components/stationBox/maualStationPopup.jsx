import { m } from "../../paraglide/messages.js";
const ManualStationPopup = ({ station, loading = false, showLink = true, idLink = false }) => {
  if (!station) return null;

  return loading ? (
    <div>{m["common_strings.loading_station"]()}...</div>
  ) : (
    <div className='train-popup'>
      <div className='train-popup__header' style={{
        paddingRight: '16px'
      }}>{station.name} ({station.code})</div>
      <div className='train-popup__info train-popup__updated greyed'>
        {station.tz}
      </div>
      <div className='train-popup__info train-popup__updated greyed'>
        {m["components.station_popup.trains_tracking"]({ count: station.trains.length })}
      </div>

      {showLink ?
        <div className='train-popup__info'>
          <a href={!idLink ? `#redirect_to:/stations/${station.code}` : `#${station.code}`}>{!idLink ? m["components.station_popup.view_trains"]() : m["components.station_popup.scroll_to_stop"]()}</a>
        </div> :
        null}
    </div>
  );
};

export default ManualStationPopup;
