import { useState, useEffect } from "react";

const SettingsInit = () => {
  const [error, setError] = useState(false);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    let settings = JSON.parse(localStorage.getItem("amtraker-v3-settings"));
    if (!settings) {
      console.log('no settings')
      try {
        localStorage.setItem(
          "amtraker-v3-settings",
          JSON.stringify({
            theme: {
              from: "dark",
            },
            foamerMode: false,
            viewAllTrains: false,
          })
        );
        console.log('set settings')
        settings = JSON.parse(localStorage.getItem("amtraker-v3-settings"));
      } catch (e) {
        console.log(e)
        setError(true);
      }
    }

    if (settings) {
      if (!settings.theme || !settings.theme.from)
        settings.theme = { from: "dark" };
      if (!settings.foamerMode) settings.foamerMode = false;
      if (!settings.viewAllTrains) settings.viewAllTrains = false;
    }
    localStorage.setItem("amtraker-v3-settings", JSON.stringify(settings));
    console.log('settings:', settings)
    setAppSettings(settings);
    console.log('settings initialized!')
  }, []);

  return error ? (
    <>There was an error loading Amtraker's settings. Please reload the page.</>
  ) : null;
};

export default SettingsInit;
