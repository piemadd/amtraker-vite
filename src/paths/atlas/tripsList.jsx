import { useState, useEffect } from 'react';

const hoursMinutesDaysDuration = (durationMinutesRaw = 0) => {
  const minutes = durationMinutesRaw;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let finalString = '';

  if (minutes < 1 && hours < 1) return '0m';
  if (days > 0) finalString += `${days}d `;
  if (hours % 24 > 0 || days > 0) finalString += `${hours % 24}h `;
  if (minutes % 60 > 0 || days > 0) finalString += `${minutes % 60}m`;

  return finalString.trim();
};

const TripsList = ({ pb, numberOfRecords, pageNumber }) => {
  if (!pb) return null;
  if (!numberOfRecords) numberOfRecords = 50;
  if (!pageNumber) pageNumber = 1;

  const [loadingTripsList, setLoadingTripsList] = useState(true);
  const [tripsList, setTripsList] = useState([]);
  const [actionTime, setActionTime] = useState(0);

  useEffect(() => {
    pb.collection('trips').getList(1, 50, {
      //filter: 'someField1 != someField2',
    }).then((resultList) => {
      setTripsList(resultList.items);
    })
  }, [numberOfRecords, pageNumber, actionTime]);

  return <table className='atlas_tripsList'>
    <thead>
      <tr>
        <th scope="col">Train</th>
        <th scope="col">Stations</th>
        <th scope="col">Date</th>
        <th scope="col">Length (mi)</th>
        <th scope="col">Duration</th>
        <th scope="col">Delete</th>
      </tr>
    </thead>
    <tbody>
      {
        tripsList.map((trip) => {
          console.log(trip)
          return <tr>
            <th scope="row">{trip.railroad != 'amtrak' ? trip.railroad.substring(0, 1) : ''}{trip.train_number}</th>
            <td>{trip.start_code} - {trip.end_code}</td>
            <td>{new Date(trip.departure_date).toLocaleDateString([], { timeZone: 'Europe/London', })}</td>
            <td>{trip.length_mi}</td>
            <td>{hoursMinutesDaysDuration(trip.time_minutes)}</td>
            <td onClick={async () => {
              const confirmationRes = confirm('This action is irreversible. Press OK to continue with deletion.');
              if (confirmationRes) await pb.collection('trips').delete(trip.id);
              setActionTime(Date.now());
            }}>❌</td>
          </tr>
        })
      }
    </tbody>
  </table>;
};

export default TripsList;