import { useState, useEffect } from "react";
import { hoursMinutesDaysDuration } from "./common";
import { Link } from "react-router-dom";

const TripsList = ({
  pb,
  numberOfRecords,
  pageNumber,
  setTripsMeta,
  dontUseFilter,
}) => {
  if (!pb) return null;
  if (!numberOfRecords) numberOfRecords = 50;
  if (!pageNumber) pageNumber = 1;
  if (!dontUseFilter) dontUseFilter = false;

  const [loadingTripsList, setLoadingTripsList] = useState(true);
  const [tripsList, setTripsList] = useState([]);
  const [actionTime, setActionTime] = useState(0);

  useEffect(() => {
    pb.collection("trips")
      .getList(pageNumber, numberOfRecords, {
        sort: "-departure_date",
        filter: dontUseFilter ? null : `user_id = '${pb.authStore.record.id}'`, // hi if youre looking through this code and think i'm only filtering on the client: i am not
        // go ahead and remove the filter, you'll still only get your own data.
      })
      .then((resultList) => {
        setTripsMeta(resultList);
        setTripsList(resultList.items);
      });
  }, [numberOfRecords, pageNumber, actionTime]);

  if (tripsList.length == 0) {
    return (
      <>
        <label>You don't have any trips recorded yet, try adding one!</label>
        <Link to={"/atlas/add"} replace={true}>
          <button className="links">
            Add Trip
          </button>
        </Link>
      </>
    );
  }

  return (
    <table className="atlas_tripsList">
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
        {tripsList.map((trip) => {
          return (
            <tr>
              <th scope="row">
                {trip.railroad != "amtrak" ? trip.railroad.substring(0, 1) : ""}
                {trip.train_number}
              </th>
              <td>
                {trip.start_code} - {trip.end_code}
              </td>
              <td>
                {new Date(trip.departure_date).toLocaleDateString([], {
                  timeZone: "Europe/London",
                })}
              </td>
              <td>{trip.length_mi}</td>
              <td>{hoursMinutesDaysDuration(trip.time_minutes)}</td>
              <td
                onClick={async () => {
                  const confirmationRes = confirm(
                    "This action is irreversible. Press OK to continue with deletion.",
                  );
                  if (confirmationRes)
                    await pb.collection("trips").delete(trip.id);
                  setActionTime(Date.now());
                }}
              >
                ❌
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TripsList;
