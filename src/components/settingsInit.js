const settingsInit = () => {
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
          mapView: 'mercator',
        })
      );
      console.log('set settings')
      settings = JSON.parse(localStorage.getItem("amtraker-v3-settings"));
    } catch (e) {
      console.log(e)
    }
  }

  if (settings) {
    if (!settings.theme || !settings.theme.from)
      settings.theme = { from: "dark" };
    if (!settings.foamerMode) settings.foamerMode = false;
    if (!settings.viewAllTrains) settings.viewAllTrains = false;
    if (!settings.mapView) settings.mapView = 'mercator';
  }
  localStorage.setItem("amtraker-v3-settings", JSON.stringify(settings));
  console.log('settings initialized!')

  return settings;
};

export const settingsDefaultState = {
  theme: {
    from: "dark",
  },
  foamerMode: false,
  viewAllTrains: false,
  mapView: 'mercator',
};

export default settingsInit;
