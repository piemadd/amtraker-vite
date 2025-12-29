import { Link } from "react-router-dom";

const AtlasNav = ({ currentRoute = null }) => {
  if (!currentRoute) currentRoute = 'index';

  return <>
  <h1>Atlas</h1>
  <label style={{maxWidth: '500px'}}>Atlas is still early in development and more features will be added over time, please be patient.</label>
    <div className='links' style={{
      marginBottom: '8px'
    }}>
      {currentRoute == 'index' ?
        <button className='root currentlyClickedButton'>
          Trips List
        </button> : <Link to={"/atlas/"} replace={true}>
          <button className='root'>Trips List</button>
        </Link>
      }

      {currentRoute == 'add' ?
        <button className='root currentlyClickedButton'>
          Add Trip
        </button> : <Link to={"/atlas/add"} replace={true}>
          <button className='root'>Add Trip</button>
        </Link>
      }
    </div>
  </>
};

export default AtlasNav;