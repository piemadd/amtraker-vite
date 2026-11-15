import { useState, useEffect } from "react";
import { hoursMinutesDaysDuration } from "./common";
import { Link } from "react-router";
import Moneyyyyyyyy from "../../components/money/moneyyyyyyyy";
import { m } from "../../paraglide/messages.js";
import { useUnits, toDisplayDistance } from "../../components/units.js";
import { getIntlLocale } from "../../components/intlLocale.js";

const TripsList = ({ pb, numberOfRecords, pageNumber, setTripsMeta, dontUseFilter, sortBy = "-departure_date" }) => {
  if (!pb) return null;
  if (!numberOfRecords) numberOfRecords = 50;
  if (!pageNumber) pageNumber = 1;
  if (!dontUseFilter) dontUseFilter = false;

  const [loadingTripsList, setLoadingTripsList] = useState(true);
  const [tripsList, setTripsList] = useState([]);
  const [actionTime, setActionTime] = useState(0);
  const units = useUnits();

  useEffect(() => {
    pb.collection("trips")
      .getList(pageNumber, numberOfRecords, {
        sort: sortBy,
        filter: dontUseFilter ? null : `user_id = '${pb.authStore.record.id}'` // hi if youre looking through this code and think i'm only filtering on the client: i am not
        // go ahead and remove the filter, you'll still only get your own data.
      })
      .then((resultList) => {
        setTripsMeta(resultList);
        setTripsList(resultList.items);
      });
  }, [numberOfRecords, pageNumber, actionTime, sortBy]);

  if (tripsList.length == 0) {
    return (
      <>
        <label>{m["pages.atlas.trips.no_trips"]()}</label>
        <Link to={"/atlas/add"} replace={true}>
          <button className="links">{m["pages.atlas.add_trip"]()}</button>
        </Link>
      </>
    );
  }

  return (
    <div className="atlas_tripsList_holder">
      <table className="atlas_tripsList">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{m["pages.atlas.trips.stations"]()}</th>
            <th scope="col">{m["pages.atlas.trips.date"]()}</th>
            <th scope="col">{units === "metric" ? m["pages.atlas.length_km"]() : m["pages.atlas.length_mi"]()}</th>
            <th scope="col">{m["pages.atlas.trips.duration"]()}</th>
            <th scope="col">{m["pages.atlas.trips.delete"]()}</th>
          </tr>
        </thead>
        <tbody>
          {tripsList.map((trip) => {
            return (
              <tr>
                <th scope="row">
                  {trip.railroad != "amtrak" && trip.railroad != "goldrunner" ? trip.railroad.substring(0, 1) : ""}
                  {trip.train_number}
                </th>
                <td>
                  {trip.start_code} - {trip.end_code}
                </td>
                <td>{new Date(trip.departure_date).toLocaleDateString(getIntlLocale(), { timeZone: "Europe/London" })}</td>
                <td>{units === "metric" ? toDisplayDistance(trip.length_mi, units).toFixed(2) : trip.length_mi}</td>
                <td>{hoursMinutesDaysDuration(trip.time_minutes)}</td>
                <td
                  onClick={async () => {
                    const confirmationRes = confirm(m["pages.atlas.trips.delete_confirm"]());
                    if (confirmationRes) await pb.collection("trips").delete(trip.id);
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
      <div style={{ marginTop: "8px" }}>
        <Moneyyyyyyyy />
      </div>
    </div>
  );
};

export default TripsList;
