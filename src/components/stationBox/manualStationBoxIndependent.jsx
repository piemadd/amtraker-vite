const toHoursAndMinutesLate = (date1, date2) => {
  if (
    date1.toString() === "Invalid Date" ||
    date2.toString() === "Invalid Date"
  )
    return "Unknown (Estimate Error)";

  const diff = date1.valueOf() - date2.valueOf();

  if (Math.abs(diff) > 1000 * 60 * 60 * 24) return "Unknown (Schedule Error)";

  const hours = Math.floor(Math.abs(diff) / 1000 / 60 / 60);
  const minutes = Math.floor((Math.abs(diff) / 1000 / 60 / 60 - hours) * 60);

  // creating the text
  let amount = `${Math.abs(hours)}h ${Math.abs(minutes)}min`;
  if (hours === 0) amount = `${Math.abs(minutes)}min`;
  if (minutes === 0) amount = `${Math.abs(hours)}h`;

  //on time
  if (diff === 0) return "On Time";

  //late or early
  return diff > 0 ? `${amount} Late` : `${amount} Early`;
};

const ManualStationBoxIndependent = ({
  station,
  loading = false,
  maxWidth = false,
  onClick = null,
}) => {
  return loading ? (
    <div className={`station-box${maxWidth ? ' train-box-max-width' : ''}`}>
      <p>Loading station data...</p>
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
            Address not available.
            <br />
            {station.tz}
          </span>
        )}
      </p>
    </div>
  );
};

export default ManualStationBoxIndependent;
