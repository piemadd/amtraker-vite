const ManualStationPopup = ({ station, loading = false }) => {
  if (!station) return null;

  return loading ? (
    <div>Loading station...</div>
  ) : (
    <div className='train-popup'>
      <div className='train-popup__header' style={{
        paddingRight: '16px'
      }}>{station.name} ({station.code})</div>
      <div className='train-popup__info train-popup__updated greyed'>
        {station.tz}
      </div>
      <div className='train-popup__info train-popup__updated greyed'>
        {station.trains.length} Train{station.trains.length > 1 ? 's' : ''} Tracking
      </div>


      <div className='train-popup__info'>
        <a href={`/stations/${station.code}`}>View Trains</a>
      </div>
    </div>
  );
};

export default ManualStationPopup;
