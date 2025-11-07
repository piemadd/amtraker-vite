const ManualStationPopup = ({ station, loading = false, showLink = true, idLink = false }) => {
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

      {showLink ?
        <div className='train-popup__info'>
          <a href={!idLink ? `#redirect_to:/stations/${station.code}` : `#${station.code}`}>{!idLink ? 'View Trains' : 'Scroll to Stop'}</a>
        </div> :
        null}
    </div>
  );
};

export default ManualStationPopup;
