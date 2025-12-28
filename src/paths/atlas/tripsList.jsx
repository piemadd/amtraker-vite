import { useState, useEffect } from 'react';
import { hoursMinutesDaysDuration } from './common';

const TripsList = ({ pb, numberOfRecords, pageNumber, setTripsMeta }) => {
  if (!pb) return null;
  if (!numberOfRecords) numberOfRecords = 50;
  if (!pageNumber) pageNumber = 1;

  const [loadingTripsList, setLoadingTripsList] = useState(true);
  const [tripsList, setTripsList] = useState([]);
  const [actionTime, setActionTime] = useState(0);

  useEffect(() => {
    pb.collection('trips').getList(pageNumber, numberOfRecords, {
      sort: '-departure_date',
    }).then((resultList) => {
      setTripsMeta(resultList);
      setTripsList(resultList.items);
    })
  }, [numberOfRecords, pageNumber, actionTime]);

  if (tripsList.length == 0) {
    return <label>You don't have any trips recorded yet, try clicking on "Add Trip" above!</label>
  }

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