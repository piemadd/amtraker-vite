import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from 'pocketbase';
import AtlasNav from "./nav";
import { hoursMinutesDaysDuration } from './common';

const pb = new PocketBase('https://pb.amtraker.com');

const AtlasStatsAll = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [atlasStats, setAtlatsStats] = useState({});
  const [topUsers, setTopUsers] = useState([]);

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
    trip_most_recent_time: 'Last User Creation',
  };

  const prettyStatValues = {
    total_length: (v) => v + 'mi',
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
            <h2>Basic Stats</h2>
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
            <h2>Top Users</h2>
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
          </section>
        </div>
      </>
    );
  }

  navigate("/atlas", { replace: true });
};

export default AtlasStatsAll;
