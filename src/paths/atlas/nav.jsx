import { Link } from "react-router-dom";

const AtlasNav = ({ currentRoute = null, userData = null }) => {
  if (!currentRoute) currentRoute = 'index';

  return <>
    <h1>Amtraker Atlas</h1>
    <details style={{
      maxWidth: '500px',
      marginBottom: '2px',
    }}>
      <summary style={{
        fontSize: '16px',
        marginBottom: '2px',

      }}>
        Beta Note
      </summary>
      <label>Atlas is still early in development and more features will be added over time, please be patient. <b>If you notice any bugs or have any feature requests</b> please email me directly at <a href="mailto:piero@piemadd.com">piero@piemadd.com</a>.</label>
    </details>

    <div className='links' style={{
      marginBottom: '8px'
    }}>
      {
        currentRoute == 'index' ?
          <button className='root currentlyClickedButton'>
            Trips List
          </button> : <Link to={"/atlas/"} replace={true}>
            <button className='root'>Trips List</button>
          </Link>
      }

      {
        currentRoute == 'add' ?
          <button className='root currentlyClickedButton'>
            Add Trip
          </button> : <Link to={"/atlas/add"} replace={true}>
            <button className='root'>Add Trip</button>
          </Link>
      }

      {
        currentRoute == 'stats_ind' ?
          <button className='root currentlyClickedButton'>
            Stats
          </button> : <Link to={"/atlas/stats"} replace={true}>
            <button className='root'>Stats</button>
          </Link>
      }

      {
        userData.permissions_admin ? (
          currentRoute == 'stats_all' ?
            <button className='root currentlyClickedButton'>
              All Stats
            </button> : <Link to={"/atlas/stats/all"} replace={true}>
              <button className='root'>All Stats</button>
            </Link>
        )
          : null
      }
    </div>
  </>
};

export default AtlasNav;