import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import "./paths/index/App.css";
import "./paths/trains/trains.css";
import ErrorPage from "./error.jsx";
import LoadingPage from "./loading";
import DataManager from "./components/dataManager/dataManager.js";
import { initAlwaysTracked } from "./tools.jsx";
import { getLocale, baseLocale, locales, localizeUrl, overwriteSetLocale } from "./paraglide/runtime.js";
//import * as serviceWorkerRegistration from "./serviceWorkerRegistration.js";

// locale is determined by the url prefix (ie /fr/trains/5), english has no prefix
// the router uses that prefix as its basename, so links within the app stay in the current locale
const basenameForLocale = (locale) => (locale === baseLocale ? "/" : `/${locale}`);

// the language picked in the language menu is remembered in localStorage (only explicit picks are saved)
const PREFERRED_LOCALE_KEY = "amtrakerPreferredLocale";
const getPreferredLocale = () => {
  try {
    const locale = localStorage.getItem(PREFERRED_LOCALE_KEY);
    return locales.includes(locale) ? locale : null;
  } catch (e) {
    return null;
  }
};
const savePreferredLocale = (locale) => {
  try {
    localStorage.setItem(PREFERRED_LOCALE_KEY, locale);
  } catch (e) {
    // storage blocked, the choice just won't be remembered
  }
};

// changes the url's locale prefix in place, keeping history.state so react router's history index
// (used by the back buttons) stays intact. returns whether the url changed
const replaceUrlLocale = (locale) => {
  if (getLocale() === locale) return false;
  window.history.replaceState(window.history.state, "", localizeUrl(window.location.href, { locale }).href);
  return true;
};

// an unprefixed url (ie from a search result) uses the saved language, but an explicit /fr/ or /es/ url is respected
// unless this page load came from the back/forward buttons, in which case it's not a link someone chose
// done before anything renders so there's no flash of the wrong language
const initialPreferredLocale = getPreferredLocale();
const isBackForwardLoad = performance.getEntriesByType?.("navigation")?.[0]?.type === "back_forward";
if (initialPreferredLocale && (getLocale() === baseLocale || isBackForwardLoad)) replaceUrlLocale(initialPreferredLocale);
document.documentElement.lang = getLocale();

console.log(`DM-N: ${JSON.stringify(window.dataManager)}`);
const dataManager = new DataManager();
window.dataManager = dataManager;

// referrer
if (document.referrer.includes("android-app://com.amtrak.piero")) {
  window.isAndroidTwaSession = false;
  sessionStorage.setItem("has_android_twa_referrer", "true");
} else {
  window.isAndroidTwaSession = sessionStorage.getItem("has_android_twa_referrer") === "true";
}

initAlwaysTracked();

//paths
import App from "./paths/index/App.jsx";

const BetterTrainsByNumber = React.lazy(() => import("./paths/trains/numBetter.jsx"));
const BetterTrainPage = React.lazy(() => import("./paths/trains/train.jsx"));
const TrainsList = React.lazy(() => import("./paths/trains/list.jsx"));
const TrainsLeaderboard = React.lazy(() => import("./paths/trains/leaderboard.jsx"));
const FullTrainsList = React.lazy(() => import("./paths/trains/listFull.jsx"));
const StationsList = React.lazy(() => import("./paths/stations/list.jsx"));
const StationPage = React.lazy(() => import("./paths/stations/station.jsx"));
//const StationBoardPage = React.lazy(() => import("./paths/stations/board.jsx"));
const Map = React.lazy(() => import("./paths/map/Map.jsx"));
const MiniMapHolderTest = React.lazy(() => import("./components/mapping/miniMapHolderTest.jsx"));
const AboutPage = React.lazy(() => import("./paths/index/about.jsx"));
const ICookaDaMeatBall = React.lazy(() => import("./paths/index/meatball"));
const AtlasIndex = React.lazy(() => import("./paths/atlas/index.jsx"));
const AtlasAdd = React.lazy(() => import("./paths/atlas/add.jsx"));
const AtlasStatsAll = React.lazy(() => import("./paths/atlas/stats_all.jsx"));
const AtlasStatsInd = React.lazy(() => import("./paths/atlas/stats_ind.jsx"));
const AtlasDeleteAccount = React.lazy(() => import("./paths/atlas/delete_account.jsx"));

const routes = [
  { path: "/", element: <App />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  { path: "/map", element: <Map />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/map/miniholdertest",
    element: <MiniMapHolderTest />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/trains", element: <TrainsList />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "trains/full",
    element: <FullTrainsList />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "trains/leaderboard",
    element: <TrainsLeaderboard />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/trains/:trainNum",
    element: <BetterTrainsByNumber />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/trains/:trainNum/:trainDate",
    element: <BetterTrainPage />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/stations",
    element: <StationsList />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/stations/:stationCode",
    element: <StationPage />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/atlas", element: <AtlasIndex />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/atlas/delete",
    element: <AtlasDeleteAccount />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/atlas/add", element: <AtlasAdd />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/atlas/stats",
    element: <AtlasStatsInd />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/atlas/stats/all",
    element: <AtlasStatsAll />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/about_settings",
    element: <Navigate to="/about" replace={true} />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  { path: "/about", element: <AboutPage />, hydrateFallbackElement: <LoadingPage />, errorElement: <ErrorPage /> },
  {
    path: "/settings",
    element: <Navigate to="/about#settings" replace={true} />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/privacy",
    element: <Navigate to="/about#privacy" replace={true} />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "/bippityboppityicookadameatball",
    element: <ICookaDaMeatBall />,
    hydrateFallbackElement: <LoadingPage />,
    errorElement: <ErrorPage />
  }
];

// the router can't change its basename, so switching locales swaps in a new router for the new prefix
// instead of reloading the page. the js bundle and dataManager's data stay loaded
const LocalizedRouter = () => {
  const createRouterInfo = (id) => ({
    id,
    locale: getLocale(),
    router: createBrowserRouter(routes, { basename: basenameForLocale(getLocale()) })
  });
  const [routerInfo, setRouterInfo] = useState(() => createRouterInfo(0));
  const routerInfoRef = useRef(routerInfo);
  const previousRouterRef = useRef(null);

  // disposing of the old router after the new one is rendered
  useEffect(() => {
    if (previousRouterRef.current && previousRouterRef.current !== routerInfo.router) previousRouterRef.current.dispose();
    previousRouterRef.current = routerInfo.router;
  }, [routerInfo]);

  useEffect(() => {
    // creates a new router (reading the current url) if forced or if the url's locale doesn't match the current router's
    const syncRouterToUrl = (force = false) => {
      if (!force && getLocale() === routerInfoRef.current.locale) return;

      const newRouterInfo = createRouterInfo(routerInfoRef.current.id + 1);
      routerInfoRef.current = newRouterInfo;
      document.documentElement.lang = newRouterInfo.locale;
      setRouterInfo(newRouterInfo);
    };

    overwriteSetLocale((newLocale, options) => {
      if (options?.reload === false) return; // paraglide calls this internally on the first getLocale()

      savePreferredLocale(newLocale);
      if (replaceUrlLocale(newLocale)) syncRouterToUrl();
    });

    // back/forward follows the saved language, ie going back to /trains/5 after picking spanish shows /es/trains/5
    // react router has already read the old url by now, so a rewritten url always gets a fresh router
    const handlePopState = () => {
      const preferredLocale = getPreferredLocale();
      const urlRewritten = preferredLocale ? replaceUrlLocale(preferredLocale) : false;
      syncRouterToUrl(urlRewritten);
    };

    // pages restored from the back/forward cache keep their old state, so they get the same check
    const handlePageShow = (e) => {
      if (e.persisted) handlePopState();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // keyed so every page remounts and re-renders its text when the router is swapped
  return <RouterProvider key={routerInfo.id} router={routerInfo.router} />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

dataManager.checkDataStatusAndUpdate().then(() => {
  root.render(
    <React.Suspense fallback={<LoadingPage />}>
      <React.StrictMode>
        <LocalizedRouter />
      </React.StrictMode>
    </React.Suspense>
  );
});
