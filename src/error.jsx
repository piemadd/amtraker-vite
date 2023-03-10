import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <div id='error-page'>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        Please copy the following and email it to me (piero@piemadd.com) so I
        can debug and fix the issue. Thanks, and apologies for the
        inconvenience.
      </p>
      <br />
      <p>
        <i>
          Current path: {window.location.href}
          <br />
          Current date and time (UTC): {new Date().toUTCString()}
          <br />
          Current date and time (local): {new Date().toLocaleString()}
          <br />
          {error.toString()}
          <br />
          Error Trace:
        </i>
      </p>
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
    </div>
  );
}
