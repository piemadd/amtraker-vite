import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";

const Settings = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  const initialSettings = useMemo(settingsInit, []);
  const [currentSettings, setCurrentSettings] = useState(initialSettings);

  const handleSettingsUpdate = (key, value) => {
    const newSettings = {
      ...currentSettings,
      [key]: value,
    };

    setCurrentSettings(newSettings);

    localStorage.setItem("amtraker-v3-settings", JSON.stringify(newSettings));

    console.log("Updated settings:", newSettings);
  };

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
          "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
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
        id="backgroundNew"
        alt="Map of Australia."
        className={"bg-focus-in peppino"}
        src={"/content/images/waow.png"}
      ></img>
      <img
        id="background"
        alt="Amtrak network map."
        className={bgClass + " terrabanner"}
        src={bgURL}
      ></img>
      <div className="trainPage">
        <div className="header-trainpage">
          <p
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
            }}
            className="click"
            style={{
              paddingLeft: "32px",
              fontSize: "24px",
              fontWeight: 500,
            }}
          >
            Back
          </p>
        </div>
        <section className="section-trainPage section-settings">
          <h1>Amtraker Settings</h1>
          <p>
            Use this page to adjust various settings for Amtraker. More settings
            will be added over time.
          </p>
          <h2>Map View</h2>
          <p>
            Whether you'd like the map to use a Globe projection or the
            traditional Web Mercator (flat) projection.
          </p>
          <select
            value={currentSettings.mapView}
            onChange={(e) => handleSettingsUpdate("mapView", e.target.value)}
          >
            <option value="mercator">Web Mercator</option>
            <option value="globe">Globe</option>
            {/*<option value='vertical-perspective'>Vertical Perspective</option>*/}
            {/* disabled due to high lag and glitching at higher zoom levels from building extrusions */}
          </select>

          {/*
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
          */}

          <h2>More?</h2>
          <p>
            If you have any feature requests for Amtraker, please send them my
            way via my email:{" "}
            <a href="mailto:hi@amtraker.com">hi@amtraker.com</a>.
          </p>

          <h2>Debug Info</h2>
          <p>User Agent</p>
          <pre>{navigator.userAgent}</pre>
          <p>Platform:</p>
          <pre>{navigator.platform}</pre>
          <p>OSCPU</p>
          <pre>{navigator.oscpu.length > 0 ? navigator.oscpu : "[empty string]"}</pre>
          <p>Vendor</p>
          <pre>{navigator.vendor.length > 0 ? navigator.vendor : "[empty string]"}</pre>
          <p>Session Storage</p>
          <pre>{JSON.stringify(sessionStorage, null, 2)}</pre>
        </section>
      </div>
    </>
  );
};

export default Settings;
