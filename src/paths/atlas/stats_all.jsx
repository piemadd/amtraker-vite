import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from 'pocketbase';
import AtlasNav from "./nav";
import { hoursMinutesDaysDuration, dateToYYYYMMDD } from './common';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

const pb = new PocketBase('https://pb.amtraker.com');

const AtlasStatsAll = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [atlasStats, setAtlatsStats] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const [dailyCreations, setDailyCreations] = useState([]);
  const [dailyDepartures, setDailyDepartures] = useState([]);

  const statKeysInOrder = [
    'trip_count',
    'user_count',
    'total_length',
    'total_time',
    'user_most_recent_time',
    'trip_most_recent_time',
  ];

  const prettyStatNames = {
    total_length: 'Total Trips Length',
    total_time: 'Total Trips Time',
    trip_count: 'Trips Count',
    user_count: 'Users Count',
    user_most_recent_time: 'Last User Creation',
    trip_most_recent_time: 'Last Trip Creation',
  };

  const prettyStatValues = {
    total_length: (v) => Intl.NumberFormat().format(v) + 'mi',
    total_time: (v) => hoursMinutesDaysDuration(v),
    user_most_recent_time: (v) => new Date(v).toLocaleString(),
    trip_most_recent_time: (v) => new Date(v).toLocaleString(),
  };

  useEffect(() => {
    // top users
    pb.collection('user_summary')
      .getList(1, 25, {
        sort: '-trip_count',
      })
      .then((data) => setTopUsers(data.items));

    // stats
    pb.collection('atlas_stats')
      .getFirstListItem()
      .then((data) => setAtlatsStats(data));

    // daily creations
    pb.collection('atlas_stats_creations')
      .getFullList({
        sort: '+date',
      })
      .then((data) => {
        let atlas_stats_creations_dict = {};
        let finalDailyCreations = [];

        data.forEach((date) => {
          console.log(date)
          atlas_stats_creations_dict[date.date] = date;
        })

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
          const currentData = atlas_stats_creations_dict[currentDateAsString] ?? {
            count_per_month: 0,
            sum_length_per_month: 0,
            sum_time_per_month: 0,
          };

          finalDailyCreations.push({
            label: currentDateAsString,
            count: currentCount += currentData.count_per_month,
            sum_length: currentSumLength += currentData.sum_length_per_month,
            sum_time: currentSumTime += currentData.sum_time_per_month,
          });
        };

        setDailyCreations(finalDailyCreations);
      });

    // daily departures
    pb.collection('atlas_stats_departures')
      .getFullList({
        sort: '+date',
      })
      .then((data) => {
        let atlas_stats_departures_dict = {};
        let finalDailyDepartures = [];

        data.forEach((date) => {
          console.log(date)
          atlas_stats_departures_dict[date.date] = date;
        })

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
          const currentData = atlas_stats_departures_dict[currentDateAsString] ?? {
            count_per_month: 0,
            sum_length_per_month: 0,
            sum_time_per_month: 0,
          };

          finalDailyDepartures.push({
            label: currentDateAsString,
            count: currentCount += currentData.count_per_month,
            sum_length: currentSumLength += currentData.sum_length_per_month,
            sum_time: currentSumTime += currentData.sum_time_per_month,
          });
        };

        setDailyDepartures(finalDailyDepartures);
      });
  }, []);

  if (pb.authStore.isValid) {
    return (
      <>
        <img
          id='background'
          alt='Amtrak network map.'
          className={bgClass + ' terrabanner'}
          src={bgURL}
        ></img>
        <div className='trainPage'>
          <div className='header-trainpage'>
            <h2
              onClick={() => {
                if (history.state.idx && history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className='click'
              style={{ paddingLeft: '32px' }}
            >
              Back
            </h2>
            <h2
              onClick={() => {
                const confirmationRes = confirm('Are you sure you want to log out?');
                if (!confirmationRes) return;
                pb.authStore.clear();
                navigate(0);
              }}
              className='click'
              style={{ paddingRight: '32px' }}
            >
              Log Out
            </h2>
          </div>
          <section className='section-trainPage'>
            <AtlasNav currentRoute={'stats_all'} userData={pb.authStore.record} />
            <h2 style={{
              marginTop: -10
            }}>Basic Stats</h2>
            <table className='atlas_tripsList'>
              <tbody>
                {
                  statKeysInOrder
                    .map((statKey) => {
                      return <tr>
                        <th scope="row">{prettyStatNames[statKey] ?? statKey}</th>
                        <td>{prettyStatValues[statKey] ? prettyStatValues[statKey](atlasStats[statKey]) : atlasStats[statKey]}</td>
                      </tr>
                    })
                }
              </tbody>
            </table>
            <h2 style={{
              marginTop: -2
            }}>Top Users</h2>
            <table className='atlas_tripsList'>
              <thead>
                <tr>
                  <th scope="col">Rank</th>
                  <th scope="col">Trip Count</th>
                  <th scope="col">Time Spent</th>
                  <th scope="col">Total Length</th>
                </tr>
              </thead>
              <tbody>
                {
                  topUsers.map((user, i) => {
                    return <tr>
                      <th scope="row">{i + 1}</th>
                      <td>{user.trip_count}</td>
                      <td>{hoursMinutesDaysDuration(user.total_time)}</td>
                      <td>{user.total_length.toFixed(2)}mi</td>
                    </tr>
                  })
                }
              </tbody>
            </table>
            <h2 style={{
              marginTop: -2,
              marginBottom: 4,
            }}>Charts</h2>
            <div style={{
              margin: '-8px -8px',
              padding: '8px 8px',
              width: '100%',
              maxWidth: '600px',
              background: '#111d',
            }}>
              <h4 style={{
                marginTop: -4,
                marginBottom: 4,
              }}>Daily Trips Created</h4>
              <Line
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: dailyCreations.map((month) => month.label),
                  datasets: [{
                    data: dailyCreations.map((month) => month.count),
                    borderWidth: 1
                  }]
                }}
              />
            </div>
            <div style={{
              margin: '-8px -8px',
              marginTop: 12,
              padding: '8px 8px',
              width: '100%',
              maxWidth: '600px',
              background: '#111d',
            }}>
              <h4 style={{
                marginTop: -4,
                marginBottom: 4,
              }}>Daily Trips Ridden</h4>
              <Line
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: dailyDepartures.map((month) => month.label),
                  datasets: [{
                    data: dailyDepartures.map((month) => month.count),
                    borderWidth: 1
                  }]
                }}
              />
            </div>
            <div style={{
              margin: '-8px -8px',
              marginTop: 12,
              padding: '8px 8px',
              width: '100%',
              maxWidth: '600px',
              background: '#111d',
            }}>
              <h4 style={{
                marginTop: -4,
                marginBottom: 4,
              }}>Daily Miles Recorded</h4>
              <Line
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: dailyCreations.map((month) => month.label),
                  datasets: [{
                    data: dailyCreations.map((month) => month.sum_length),
                    borderWidth: 1
                  }]
                }}
              />
            </div>
            <div style={{
              margin: '-8px -8px',
              marginTop: 12,
              padding: '8px 8px',
              width: '100%',
              maxWidth: '600px',
              background: '#111d',
            }}>
              <h4 style={{
                marginTop: -4,
                marginBottom: 4,
              }}>Daily Miles Ridden</h4>
              <Line
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: dailyDepartures.map((month) => month.label),
                  datasets: [{
                    data: dailyDepartures.map((month) => month.sum_length),
                    borderWidth: 1
                  }]
                }}
              />
            </div>
            <div style={{
              margin: '-8px -8px',
              marginTop: 12,
              padding: '8px 8px',
              width: '100%',
              maxWidth: '600px',
              background: '#111d',
            }}>
              <h4 style={{
                marginTop: -4,
                marginBottom: 4,
              }}>Daily Minutes Recorded</h4>
              <Line
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: dailyCreations.map((month) => month.label),
                  datasets: [{
                    data: dailyCreations.map((month) => month.sum_time),
                    borderWidth: 1
                  }]
                }}
              />
            </div>
            <div style={{
              margin: '-8px -8px',
              marginTop: 12,
              padding: '8px 8px',
              width: '100%',
              maxWidth: '600px',
              background: '#111d',
            }}>
              <h4 style={{
                marginTop: -4,
                marginBottom: 4,
              }}>Daily Minutes Ridden</h4>
              <Line
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: dailyDepartures.map((month) => month.label),
                  datasets: [{
                    data: dailyDepartures.map((month) => month.sum_time),
                    borderWidth: 1
                  }]
                }}
              />
            </div>
          </section>
        </div>
      </>
    );
  }

  navigate("/atlas", { replace: true });
};

export default AtlasStatsAll;
