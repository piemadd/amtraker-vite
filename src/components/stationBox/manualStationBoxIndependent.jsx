import { m } from "../../paraglide/messages.js";
const ManualStationBoxIndependent = ({
  station,
  loading = false,
  maxWidth = false,
  onClick = null,
}) => {
  return loading ? (
    <div className={`station-box${maxWidth ? ' train-box-max-width' : ''}`}>
      <p>{m["common_strings.loading_station_data"]()}...</p>
    </div>
  ) : (
    <div className={`station-box${maxWidth ? ' train-box-max-width' : ''}`} onClick={onClick}>
      <div>
        {station.name} ({station.code})&nbsp;
      </div>
      <p>
        {station.hasAddress ? (
          <span className='greyed'>
            {station.address1}{" "}
            {station.address2 !== " "
              ? station.address2
              : null}
            <br />
            {station.city}, {station.state} {station.zip}
            <br />
            {station.tz}
          </span>
        ) : (
          <span className='greyed'>
            {m["common_strings.address_unavailable"]()}
            <br />
            {station.tz}
          </span>
        )}
      </p>
    </div>
  );
};

export default ManualStationBoxIndependent;
