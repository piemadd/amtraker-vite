import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <>
      <img
        alt={"A slightly blurred version of a map of Amtrak's Network"}
        id='background'
        className='bg-focus-in'
        src='/content/images/amtraker-bg.webp'
      ></img>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              navigate(-1);
              navigate("/", { replace: true }); //fallback
            }}
            className='click'
          >
            Back
          </h2>
        </div>
        <section className='section-trainPage section-settings'>
          <h1>Amtraker Settings</h1>
          <p>
            Use this page to adjust various settings for Amtraker. More settings
            will be added over time.
          </p>
          <h2>Theme</h2>
          <p>
            Amtraker currently only has dark theme, light theme will be added at
            a later date, along with further theme customization.
          </p>
          <select
            disabled
            style={{
              color: "#777",
            }}
          >
            <option value='dark'>Dark</option>
            <option value='light' disabled>
              Light
            </option>
          </select>
          {/*
          <h2>Foamer Mode</h2>
          <p>
            Foamer Mode makes using Amtraker a bit more pleasant for foamers,
            but its features may be confusing and simply not useful for regular
            users. If you are wondering what a foamer is, you probably aren't
            one, but "foamer" is a derogatory term used to describe rail
            fans: people who take pictures of trains for fun. Here is a list of
            the current features:
          </p>
          <ul>
            <li>
              <i>Train ETA:</i> The time until a train is estimated to pass a
              user along the train tracks is given. Can be useful for stations
              in which the train does not stop. This feature is currently in
              beta, and can be inaccurate. Accuracy will be greatly improved
              once out of beta.
            </li>
            <li>
              <i>User Location:</i> The location of a user is shown on the
              tracking map. Can be helpful if you are new to a location and
              aren't sure where you are in relation to the train route.
            </li>
          </ul>
          <select
            onChange={(e) => {
              console.log("changing foamer mode to", e.target.value);
              let settings = JSON.parse(
                localStorage.getItem("amtraker-v3-settings")
              );
              settings.foamerMode = e.target.value === "true" ? true : false;
              localStorage.setItem(
                "amtraker-v3-settings",
                JSON.stringify(settings)
              );
            }}
          >
            {JSON.parse(localStorage.getItem("amtraker-v3-settings"))
              .foamerMode ? (
              <>
                <option value='true' key='foamer-mode-enabled'>
                  Enabled
                </option>
                <option value='false' key='foamer-mode-disabled'>
                  Disabled
                </option>
              </>
            ) : (
              <>
                <option value='false' key='foamer-mode-disabled'>
                  Disabled
                </option>
                <option value='true' key='foamer-mode-enabled'>
                  Enabled
                </option>
              </>
            )}
          </select>
          */}
          <h2>More?</h2>
          <p>
            If you have any feature requests for Amtraker, please send them my
            way via my email: hi (at) amtraker (dot) com.
          </p>
        </section>
      </div>
    </>
  );
};

export default Settings;
