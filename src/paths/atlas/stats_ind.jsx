import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from 'pocketbase';
import AtlasNav from "./nav";
import { hoursMinutesDaysDuration } from './common';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const pb = new PocketBase('https://pb.amtraker.com');

const AtlasStatsInd = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [userSummary, setUserSummary] = useState({
    total_length: 0,
    total_length_curr_year: 0,
    total_time: 0,
    total_time_curr_year: 0,
    trip_count: 0,
    trip_count_curr_year: 0,
    top_station: '',
    top_station_curr_year: '',
  });
  const [lastTwelveMonths, setLastTwelveMonths] = useState([]);

  useEffect(() => {
    // user summary
    pb.collection('user_summary')
      .getOne(pb.authStore.record.id)
      .then((data) => setUserSummary(data));

    pb.collection('user_trips_monthly')
      .getFullList({
        sort: '-year_month',
        filter: `user_id = '${pb.authStore.record.id}'`
      })
      .then((data) => {
        const dateToYYYYMM = (date) => {
          const yearFull = date.getUTCFullYear();
          const monthFull = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          return `${yearFull}-${monthFull}`;
        };

        const now = new Date();
        const currentMonthDate = new Date(dateToYYYYMM(now));

        let lastTwelveMonthStrings = [];

        while (lastTwelveMonthStrings.length < 12) {
          lastTwelveMonthStrings.push(dateToYYYYMM(currentMonthDate));
          currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
        }

        // reversing to be chronological
        lastTwelveMonthStrings.reverse();

        // building a dictionary of actual data
        let dbDataDict = {};
        data.forEach((data) => {
          dbDataDict[data.year_month] = {
            count: data.count_per_month_user,
            sum_length: data.sum_length_per_month_user,
            sum_time: data.sum_time_per_month_user,
          }
        });

        let finalDataForChart = [];

        lastTwelveMonthStrings.forEach((monthString) => {
          const dbData = dbDataDict[monthString] || {
            count: 0,
            sum_length: 0,
            sum_time: 0,
          };

          finalDataForChart.push({
            label: new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "short",
              timeZone: "UTC",
            }).format(new Date(monthString)),
            ...dbData,
          })
        });

        setLastTwelveMonths(finalDataForChart);
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
            <AtlasNav currentRoute={'stats_ind'} userData={pb.authStore.record} />
            <h2 style={{
              marginTop: -10
            }}>This Year</h2>
            <div className="atlas-stats-ind-stat">
              <p>
                {userSummary.trip_count_curr_year}
                <span>Trips Taken</span>
              </p>
              <hr />
              <p>
                {Intl.NumberFormat().format(userSummary.total_length_curr_year)}
                <span>Miles Traveled</span>
              </p>
              <hr />
              <p>
                {hoursMinutesDaysDuration(userSummary.total_time_curr_year)}
                <span>Time Spent</span>
              </p>
              <hr />
              <p>
                {userSummary.top_station_curr_year ?? 'N/A'}
                <span>Top Station</span>
              </p>
            </div>
            <h2 style={{
              marginTop: -2
            }}>Overall</h2>
            <div className="atlas-stats-ind-stat">
              <p>
                {userSummary.trip_count}
                <span>Trips Taken</span>
              </p>
              <hr />
              <p>
                {Intl.NumberFormat().format(userSummary.total_length)}
                <span>Miles Traveled</span>
              </p>
              <hr />
              <p>
                {hoursMinutesDaysDuration(userSummary.total_time)}
                <span>Time Spent</span>
              </p>
              <hr />
              <p>
                {userSummary.top_station ?? 'N/A'}
                <span>Top Station</span>
              </p>
            </div>
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
              }}>Monthly Trips</h4>
              <Bar
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: lastTwelveMonths.map((month) => month.label),
                  datasets: [{
                    data: lastTwelveMonths.map((month) => month.count),
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
              }}>Monthly Miles</h4>
              <Bar
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: lastTwelveMonths.map((month) => month.label),
                  datasets: [{
                    data: lastTwelveMonths.map((month) => month.sum_length),
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
              }}>Monthly Minutes</h4>
              <Bar
                options={{
                  plugins: {
                    legend: false,
                  }
                }}
                data={{
                  labels: lastTwelveMonths.map((month) => month.label),
                  datasets: [{
                    data: lastTwelveMonths.map((month) => month.sum_time),
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

export default AtlasStatsInd;
