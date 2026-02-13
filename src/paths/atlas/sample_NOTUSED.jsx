import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import AtlasNav from "./nav";

const pb = new PocketBase("https://pb.amtraker.com");

const AtlasAdd = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  if (pb.authStore.isValid) {
    return (
      <>
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
          <section className="section-trainPage">
            <AtlasNav currentRoute={"index"} userData={pb.authStore.record} />
            <div>Logged in!</div>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
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
        <section className="section-trainPage">
          <h1>Atlas</h1>
          <p>
            Amtraker Atlas allows you to track your Amtrak, Brightline, and VIA
            rail trips, similar to Flighty Passport with flights.
          </p>
          <button
            className="root"
            onClick={async () => {
              await pb
                .collection("users")
                .authWithOAuth2({ provider: "google" });
            }}
          >
            Login With Google
          </button>
        </section>
      </div>
    </>
  );
};

export default AtlasAdd;
