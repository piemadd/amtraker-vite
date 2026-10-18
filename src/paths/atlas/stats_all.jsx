import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import AtlasNav from "./nav";
import { hoursMinutesDaysDuration, dateToYYYYMMDD } from "./common";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { m } from "../../paraglide/messages.js";
import LanguageButtons from "../../components/buttons/languageButtons";

const pb = new PocketBase("https://pb.amtraker.com");

const AtlasStatsAll = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [atlasStats, setAtlatsStats] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const [dailyCreations, setDailyCreations] = useState([]);
  const [dailyDepartures, setDailyDepartures] = useState([]);
  const [dailyUserCreations, setDailyUserCreations] = useState([]);

  const statKeysInOrder = [
    "trip_count",
    "user_count",
    "total_length",
    "total_time",
    "user_most_recent_time",
    "trip_most_recent_time",
  ];

  const prettyStatNames = {
    total_length: m["pages.atlas.stats_all.total_trips_length"](),
    total_time: m["pages.atlas.stats_all.total_trips_time"](),
    trip_count: m["pages.atlas.stats_all.trips_count"](),
    user_count: m["pages.atlas.stats_all.users_count"](),
    user_most_recent_time: m["pages.atlas.stats_all.last_user_creation"](),
    trip_most_recent_time: m["pages.atlas.stats_all.last_trip_creation"](),
  };

  const prettyStatValues = {
    total_length: (v) => m["pages.atlas.stats_all.length_mi_value"]({ length: Intl.NumberFormat().format(v) }),
    total_time: (v) => hoursMinutesDaysDuration(v),
    user_most_recent_time: (v) => new Date(v).toLocaleString(),
    trip_most_recent_time: (v) => new Date(v).toLocaleString(),
  };

  const processGraphData = (data) => {
    let db_dict = {};
    let finalData = [];

    data.forEach((date) => {
      db_dict[date.date] = date;
    });

    const beginningDate = new Date(data[0].date);
    const endingDate = new Date(data[data.length - 1].date);

    let currentCount = 0;
    let currentSumLength = 0;
    let currentSumTime = 0;

    for (
      let currentDate = new Date(beginningDate);
      currentDate.valueOf() <= endingDate.valueOf();
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    ) {
      const currentDateAsString = dateToYYYYMMDD(currentDate);
      const currentData = db_dict[currentDateAsString] ?? {
        count: 0,
        sum_length: 0,
        sum_time: 0,
      };

      finalData.push({
        label: currentDateAsString,
        count: (currentCount += currentData.count ?? 0),
        sum_length: (currentSumLength += currentData.sum_length ?? 0),
        sum_time: (currentSumTime += currentData.sum_time ?? 0),
      });
    }

    return finalData;
  };

  useEffect(() => {
    // top users
    pb.collection("user_summary")
      .getList(1, 25, {
        sort: "-trip_count",
      })
      .then((data) => setTopUsers(data.items));

    // stats
    pb.collection("atlas_stats")
      .getFirstListItem()
      .then((data) => setAtlatsStats(data));

    // daily creations
    pb.collection("atlas_stats_creations")
      .getFullList({
        sort: "+date",
      })
      .then((data) => {
        setDailyCreations(processGraphData(data));
      });

    // daily departures
    pb.collection("atlas_stats_departures")
      .getFullList({
        sort: "+date",
      })
      .then((data) => {
        setDailyDepartures(processGraphData(data));
      });

    // daily user creation
    pb.collection("user_created_summary")
      .getFullList({
        sort: "+date",
      })
      .then((data) => {
        setDailyUserCreations(processGraphData(data));
      });
  }, []);

  if (pb.authStore.isValid) {
    return (
      <>
        <img
          id="background"
          alt={m["common_strings.background_alt"]()}
          className={bgClass + " terrabanner"}
          src={bgURL}
        ></img>
        <div className="trainPage">
          <div className="header-trainpage">
            <p
              onClick={() => {
                if (history.state.idx && history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className="click"
              style={{
                paddingLeft: "32px",
                fontSize: "24px",
                fontWeight: 500,
              }}
            >
              {m["common_strings.back"]()}
            </p>
            <div className="multiButtonHolder" style={{ alignItems: "center" }}>
              <LanguageButtons headerStyle={true} />
              <p
                onClick={() => {
                  const confirmationRes = confirm(m["common_strings.log_out_confirm"]());
                  if (!confirmationRes) return;
                  pb.authStore.clear();
                  navigate(0);
                }}
                className="click"
                style={{ 
                  paddingRight: '32px',
                  fontSize: '24px',
                  fontWeight: 500,
                 }}
              >
                {m["common_strings.log_out"]()}
              </p>
            </div>
          </div>
          <section className="section-trainPage">
            <AtlasNav
              currentRoute={"stats_all"}
              userData={pb.authStore.record}
            />
            <h2
              style={{
                marginTop: -2,
              }}
            >
              {m["pages.atlas.stats_all.basic_stats"]()}
            </h2>
            <table className="atlas_tripsList">
              <tbody>
                {statKeysInOrder.map((statKey) => {
                  return (
                    <tr>
                      <th scope="row">{prettyStatNames[statKey] ?? statKey}</th>
                      <td>
                        {prettyStatValues[statKey]
                          ? prettyStatValues[statKey](atlasStats[statKey])
                          : atlasStats[statKey]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <h2
              style={{
                marginTop: -2,
              }}
            >
              {m["pages.atlas.stats_all.top_users"]()}
            </h2>
            <table className="atlas_tripsList">
              <thead>
                <tr>
                  <th scope="col">{m["pages.atlas.stats_all.rank"]()}</th>
                  <th scope="col">{m["pages.atlas.stats_all.trip_count"]()}</th>
                  <th scope="col">{m["pages.atlas.time_spent"]()}</th>
                  <th scope="col">{m["pages.atlas.stats_all.total_length"]()}</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, i) => {
                  return (
                    <tr>
                      <th scope="row">{i + 1}</th>
                      <td>{user.trip_count}</td>
                      <td>{hoursMinutesDaysDuration(user.total_time)}</td>
                      <td>{m["pages.atlas.stats_all.length_mi_value"]({ length: user.total_length.toFixed(2) })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <h2
              style={{
                marginTop: -2,
              }}
            >
              {m["pages.atlas.charts"]()}
            </h2>
            <details
              style={{
                width: "100%",
                maxWidth: "600px",
                marginTop: "-8px",
              }}
            >
              <summary
                style={{
                  fontSize: "20px",
                  marginBottom: "-12px",
                }}
              >
                {m["pages.atlas.stats_all.trips_recorded"]()}
              </summary>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_trips_created"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyCreations.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyCreations.map((month) => month.count),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_miles_recorded"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyCreations.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyCreations.map((month) => month.sum_length),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_minutes_recorded"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyCreations.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyCreations.map((month) => month.sum_time),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </details>
            <details
              style={{
                width: "100%",
                maxWidth: "600px",
                marginTop: "8px",
              }}
            >
              <summary
                style={{
                  fontSize: "20px",
                  marginBottom: "-12px",
                }}
              >
                {m["pages.atlas.stats_all.trips_ridden"]()}
              </summary>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_trips_ridden"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyDepartures.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyDepartures.map((month) => month.count),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_miles_ridden"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyDepartures.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyDepartures.map((month) => month.sum_length),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_minutes_ridden"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyDepartures.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyDepartures.map((month) => month.sum_time),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </details>
            <details
              style={{
                width: "100%",
                maxWidth: "600px",
                marginTop: "8px",
              }}
            >
              <summary
                style={{
                  fontSize: "20px",
                  marginBottom: "-12px",
                }}
              >
                {m["pages.atlas.stats_all.users_created"]()}
              </summary>
              <div
                style={{
                  margin: "-8px -8px",
                  marginTop: 12,
                  padding: "8px 8px",
                  width: "100%",
                  maxWidth: "600px",
                  background: "#111d",
                }}
              >
                <h4
                  style={{
                    marginTop: -4,
                    marginBottom: 4,
                  }}
                >
                  {m["pages.atlas.stats_all.daily_account_creation"]()}
                </h4>
                <Line
                  options={{
                    plugins: {
                      legend: false,
                    },
                  }}
                  data={{
                    labels: dailyUserCreations.map((month) => month.label),
                    datasets: [
                      {
                        data: dailyUserCreations.map((month) => month.count),
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </details>
          </section>
        </div>
      </>
    );
  }

  navigate("/atlas", { replace: true });
};

export default AtlasStatsAll;
