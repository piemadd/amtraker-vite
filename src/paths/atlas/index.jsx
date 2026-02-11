import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import AtlasNav from "./nav";
import TripsList from "./tripsList";
import AppleLogo from "./apple";

const pb = new PocketBase("https://pb.amtraker.com");

const AtlasIndex = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [authUpdatedAt, setAuthUpdatedAt] = useState(0);
  const [tripsMeta, setTripsMeta] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  console.log(authUpdatedAt);

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
            <h2
              onClick={() => {
                if (history.state.idx && history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className="click"
              style={{ paddingLeft: "32px" }}
            >
              Back
            </h2>
            <h2
              onClick={() => {
                const confirmationRes = confirm(
                  "Are you sure you want to log out?",
                );
                if (!confirmationRes) return;
                pb.authStore.clear();
                navigate(0);
              }}
              className="click"
              style={{ paddingRight: "32px" }}
            >
              Log Out
            </h2>
          </div>
          <section className="section-trainPage">
            <AtlasNav currentRoute={"index"} userData={pb.authStore.record} />
            {tripsMeta && tripsMeta.totalItems > 0 ? (
              <>
                <label>Page Selection</label>
                <div
                  className="links"
                  style={{
                    marginBottom: "8px",
                  }}
                >
                  {Array(tripsMeta.totalPages)
                    .fill("amongus")
                    .map((val, i) => {
                      return (
                        <button
                          className={
                            "root" +
                            (pageNumber == i + 1
                              ? " currentlyClickedButton"
                              : "")
                          }
                          onClick={(e) => setPageNumber(i + 1)}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  <Link to={"/atlas/add"} replace={true}>
                    <button
                      className="links"
                      style={{
                        marginBottom: "8px",
                        height: "100%",
                      }}
                    >
                      Add Trip
                    </button>
                  </Link>
                </div>
              </>
            ) : null}
            <TripsList
              pb={pb}
              numberOfRecords={50}
              pageNumber={pageNumber}
              setTripsMeta={setTripsMeta}
            />
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
          <h2
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
            }}
            className="click"
            style={{ paddingLeft: "32px" }}
          >
            Back
          </h2>
        </div>
        <section className="section-trainPage">
          <h1>Atlas</h1>
          <details
            style={{
              maxWidth: "500px",
              marginBottom: "2px",
            }}
          >
            <summary
              style={{
                fontSize: "16px",
                marginBottom: "2px",
              }}
            >
              Atlas Note
            </summary>
            <label>
              <b>If you notice any bugs or have any feature requests</b> please
              email me directly at{" "}
              <a href="mailto:piero@piemadd.com">piero@piemadd.com</a>. It is
              important to note{" "}
              <i>
                <b>
                  Atlas is not required to use the regular train tracking
                  aspects of Amtraker
                </b>
              </i>
              .
            </label>
          </details>
          <button
            className="root"
            onClick={async () => {
              await pb
                .collection("users")
                .authWithOAuth2({ provider: "google" });
              setAuthUpdatedAt(Date.now());
            }}
          >
            Login With Google
          </button>
          <p>===== or =====</p>
          <button
            className="root"
            style={{
              backgroundColor: "#fff",
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: "0px",
              paddingRight: "12px",
              border: "solid 1px #000000",
              borderRadius: "8px",
            }}
            onClick={async () => {
              await pb
                .collection("users")
                .authWithOAuth2({ provider: "google" });
              setAuthUpdatedAt(Date.now());
            }}
          >
            <AppleLogo
              style={{
                margin: "-16px -8px -18px -16px",
              }}
            />{" "}
            Login With Apple
          </button>
          <p>===== or =====</p>
          <label htmlFor="atlas-login_email">Email</label>
          <input
            name="login_email"
            id="atlas-login_email"
            onChange={(e) => setCurrentUsername(e.target.value)}
            value={currentUsername}
            type="email"
          />
          <label htmlFor="atlas-login_password">Password</label>
          <input
            name="login_password"
            id="atlas-login_password"
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            value={currentPassword}
          />
          <button
            className="root"
            onClick={async () => {
              await pb
                .collection("users")
                .authWithPassword(currentUsername, currentPassword);
              setAuthUpdatedAt(Date.now());
            }}
          >
            Login With User/Pass
          </button>
        </section>
      </div>
    </>
  );
};

export default AtlasIndex;
