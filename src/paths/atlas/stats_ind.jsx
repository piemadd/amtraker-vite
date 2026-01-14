import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from 'pocketbase';
import AtlasNav from "./nav";
import { hoursMinutesDaysDuration } from './common';

const pb = new PocketBase('https://pb.amtraker.com');

const AtlasStatsInd = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [atlasStats, setAtlatsStats] = useState({});
  const [userSummary, setUserSummary] = useState({
    total_length: 0,
    total_length_curr_year: 0,
    total_time: 0,
    total_time_curr_year: 0,
    trip_count: 0,
    trip_count_curr_year: 0
  });

  useEffect(() => {
    // top users
    pb.collection('user_summary')
      .getOne(pb.authStore.record.id)
      .then((data) => setUserSummary(data));

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
            <AtlasNav currentRoute={'stats_ind'} userData={pb.authStore.record} />
            <h2>This Year</h2>
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
            </div>
            <h2>Overall</h2>
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
            </div>
          </section>
        </div>
      </>
    );
  }

  navigate("/atlas", { replace: true });
};

export default AtlasStatsInd;
