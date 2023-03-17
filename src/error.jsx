import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const errorString = error.toString();

  return (
    <div id='error-page'>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        Please copy the following and email it to me (piero@piemadd.com) so I
        can debug and fix the issue. Thanks, and apologies for the
        inconvenience.
      </p>
      <p>
        If the error number below doesn't match up with the error number on the
        home page, chances are your error has already been fixed. If so,
        clearing your cache should fix the issue.
      </p>
      <br />
      {errorString.includes("error loading dynamically imported module") ? (
        <p>
          Seems like the issue you're facing might be data related, which is
          usually intermittent. Please try again in 3-4 minutes. I aplogize for
          the inconvenience
        </p>
      ) : null}
      <p>
        <i>
          Current path: {window.location.href}
          <br />
          Current version: v3.4.5
          <br />
          Current date and time (UTC): {new Date().toUTCString()}
          <br />
          Current date and time (local): {new Date().toLocaleString()}
          <br />
          {error.toString()}
          {/*
            <br />
          Error Trace:
      */}
        </i>
      </p>
      {/*
        <div>
          {error.stack
            .split("\n")
            .filter((n) => n)
            .map((line, i) => (
              <p className='errorTrace' key={`error-trace-${i}`}>
                {line}
              </p>
            ))}
        </div>
            */}
    </div>
  );
}
