import { useRouteError } from "react-router";
import { useEffect } from "react";
import { m } from "./paraglide/messages.js";
import { getIntlLocale } from "./components/intlLocale.js";

export default function ErrorPage() {
  const error = useRouteError();

  console.log(error);

  const errorString = error.toString();

  console.log(errorString);

  if (
    errorString.includes("error loading dynamically imported module") ||
    errorString.includes("Failed to fetch dynamically imported module") ||
    errorString.includes("dynamically imported module") ||
    errorString.includes("'text/html' is not a valid JavaScript MIME type") ||
    errorString.includes("Unable to preload CSS for") ||
    errorString.includes("module script failed")
  ) {
    useEffect(() => {
      console.log("clearing cache");
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== "mapbox-tiles") caches.delete(key);
        });

        console.log("cleared cache!");
        caches.keys().then((newKeys) => console.log("new caches:", newKeys));
      });

      //also need to yeet the service worker
      if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    return (
      <div id="error-page">
        <h2>{m["pages.error.cache_update_title"]()}</h2>
        <p>{m["pages.error.cache_update_body"]()}</p>
        <br />
        <p>{m["pages.error.reloading"]()}</p>
      </div>
    );
  } else if (error.status === 404) {
    return (
      <div id="error-page">
        <h1>{m["pages.error.not_found_title"]()}</h1>
        <p>{m["pages.error.not_found_body"]()}</p>
        <p>
          {m["pages.error.report_request"]()}
        </p>
        <p>
          <i>
            {m["pages.error.current_path"]({ path: window.location.href })}
            <br />
            {m["pages.error.current_version"]({ version: "v3.21.21" })}
            <br />
            {m["pages.error.current_time_utc"]({ time: new Date().toUTCString() })}
            <br />
            {m["pages.error.current_time_local"]({ time: new Date().toLocaleString(getIntlLocale()) })}
            <br />
            {errorString}
          </i>
        </p>
      </div>
    );
  } else {
    return (
      <div id="error-page">
        <h1>{m["pages.error.oops_title"]()}</h1>
        <p>{m["pages.error.oops_body"]()}</p>
        <p>
          {m["pages.error.report_request"]()}
        </p>
        <br />
        <p>
          <i>
            {m["pages.error.current_path"]({ path: window.location.href })}
            <br />
            {m["pages.error.current_version"]({ version: "v3.21.21" })}
            <br />
            {m["pages.error.current_time_utc"]({ time: new Date().toUTCString() })}
            <br />
            {m["pages.error.current_time_local"]({ time: new Date().toLocaleString(getIntlLocale()) })}
            <br />
            {errorString}
          </i>
        </p>
      </div>
    );
  }
}
