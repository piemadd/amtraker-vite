import { Link } from "react-router-dom";

const AtlasNav = ({ currentRoute = null, userData = null }) => {
  if (!currentRoute) currentRoute = 'index';

  return <>
    <h1 style={{
      fontSize: 40,
    }}>Amtraker Atlas</h1>
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

    <div className='linksJoined' style={{
      marginBottom: '8px'
    }}>
      {
        currentRoute == 'index' ?
          <a href="#" onClick={() => { }}>
            <button className='joinedLink currentlyClickedButton'>
              Trips List
            </button>
          </a> : <Link to={"/atlas/"} replace={true}>
            <button className='joinedLink'>Trips List</button>
          </Link>
      }

      {
        currentRoute == 'add' ?
          <a href="#" onClick={() => { }}>
            <button className='joinedLink currentlyClickedButton'>
              Add Trip
            </button>
          </a> : <Link to={"/atlas/add"} replace={true}>
            <button className='joinedLink'>Add Trip</button>
          </Link>
      }

      {
        currentRoute == 'stats_ind' ?
          <a href="#" onClick={() => { }}>
            <button className='joinedLink currentlyClickedButton'>
              Stats
            </button>
          </a> : <Link to={"/atlas/stats"} replace={true}>
            <button className='joinedLink'>Stats</button>
          </Link>
      }

      {
        userData.permissions_admin ? (
          currentRoute == 'stats_all' ?
            <a href="#" onClick={() => { }}>
              <button className='joinedLink currentlyClickedButton'>
                All Stats
              </button>
            </a> : <Link to={"/atlas/stats/all"} replace={true}>
              <button className='joinedLink'>All Stats</button>
            </Link>
        )
          : null
      }
    </div>
  </>
};

export default AtlasNav;