import { Link } from "react-router";
import { m } from "../../paraglide/messages.js";

const AtlasNav = ({ currentRoute = null, userData = null }) => {
  if (!currentRoute) currentRoute = "index";

  if (!userData) return null;

  return (
    <>
      <h1
        style={{
          fontSize: 40,
        }}
      >
        {m["pages.atlas.amtraker_atlas"]()}
      </h1>
      <details
        style={{
          maxWidth: "500px",
          marginBottom: "2px",
        }}
      >
        <summary
          style={{
            fontSize: "16px",
            marginBottom: "2px",
          }}
        >
          {m["pages.atlas.note_title"]()}
        </summary>
        <label>
          <b>{m["pages.atlas.note_bugs"]()}</b> {m["pages.atlas.note_email"]()}{" "}
          <a href="mailto:piero@piemadd.com">piero@piemadd.com</a>.{" "}
          {m["pages.atlas.note_important"]()}{" "}
          <i>
            <b>{m["pages.atlas.note_not_required"]()}</b>
          </i>
          .
        </label>
      </details>
      <details
        style={{
          maxWidth: "500px",
          marginBottom: "2px",
        }}
      >
        <summary
          style={{
            fontSize: "16px",
            marginBottom: "2px",
          }}
        >
          {m["pages.atlas.account_deletion"]()}
        </summary>
        <label>
          {m["pages.atlas.account_deletion_prompt"]()}{" "}
          <Link to={"/atlas/delete"} replace={true}>
            <b>
              <u>{m["pages.atlas.account_deletion_link"]()}</u>
            </b>
          </Link>
          .
        </label>
      </details>

      <div
        className="linksJoined"
      >
        {currentRoute == "index" ? (
          <a href="#" onClick={() => {}}>
            <button className="joinedLink currentlyClickedButton">
              {m["pages.atlas.trips_list"]()}
            </button>
          </a>
        ) : (
          <Link to={"/atlas/"} replace={true}>
            <button className="joinedLink">{m["pages.atlas.trips_list"]()}</button>
          </Link>
        )}

        {/*
        currentRoute == 'add' ?
          <a href="#" onClick={() => { }}>
            <button className='joinedLink currentlyClickedButton'>
              Add Trip
            </button>
          </a> : <Link to={"/atlas/add"} replace={true}>
            <button className='joinedLink'>Add Trip</button>
          </Link>
        */}

        {currentRoute == "stats_ind" ? (
          <a href="#" onClick={() => {}}>
            <button className="joinedLink currentlyClickedButton">{m["pages.atlas.stats"]()}</button>
          </a>
        ) : (
          <Link to={"/atlas/stats"} replace={true}>
            <button className="joinedLink">{m["pages.atlas.stats"]()}</button>
          </Link>
        )}

        {userData.permissions_admin ? (
          currentRoute == "stats_all" ? (
            <a href="#" onClick={() => {}}>
              <button className="joinedLink currentlyClickedButton">
                {m["pages.atlas.all_stats"]()}
              </button>
            </a>
          ) : (
            <Link to={"/atlas/stats/all"} replace={true}>
              <button className="joinedLink">{m["pages.atlas.all_stats"]()}</button>
            </Link>
          )
        ) : null}
      </div>
    </>
  );
};

export default AtlasNav;
