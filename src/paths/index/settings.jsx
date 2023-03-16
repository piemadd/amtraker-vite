import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { stringToHash } from "./iCookaDaMeatball";

const Settings = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-bg.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
        "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });
  }, []);

  return (
    <>
      <img
        id='background' alt='Amtrak network map.'
        className={bgClass}
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
          <h2>Foamer Mode</h2>
          <p>
            Foamer Mode makes using Amtraker a bit more pleasant for foamers,
            but its features may be confusing and simply not useful for regular
            users. If you are wondering what a foamer is, you probably aren't
            one, but "foamer" is a term used to describe rail fans: people who
            take pictures of trains for fun. Here is a list of the current
            features:
          </p>
          <ul>
            <li>
              <i>Train ETA:</i> Using a user's location, Amtraker can estimate
              when a train will pass a user along the route. The algorithm is
              far from perfect (it tends to underestimate the ETA), but it can
              be helpful for those who want to time their shots better. This
              feature is currently in beta and should improve over time.
            </li>
            <li>
              <i>User Location:</i> The location of a user is shown on the
              tracking map. This can be helpful for those who are new to a
              location and aren't sure where they are in relation to the train
              route.
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
          <h2>More?</h2>
          <p>
            If you have any feature requests for Amtraker, please send them my
            way via my email:{" "}
            <a href='mailto:hi@amtraker.com'>hi@amtraker.com</a>.
          </p>
        </section>
      </div>
    </>
  );
};

export default Settings;
