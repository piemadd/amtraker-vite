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
