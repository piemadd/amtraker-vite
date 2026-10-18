import { useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import AtlasNav from "./nav";
import TripsList from "./tripsList";
import AppleLogo from "./apple";
import { m } from "../../paraglide/messages.js";

const pb = new PocketBase("https://pb.amtraker.com");

const AtlasIndex = () => {
  const navigate = useNavigate();

  document.title = m["pages.atlas.index.page_title"]();
  document.querySelector('meta[name="description"]').setAttribute("content", m["pages.atlas.index.meta_description"]());
  document
    .querySelector('meta[property="og:image"]')
    .setAttribute("content", "https://amtraker.com/content/images/amtraker-back.webp");

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [authUpdatedAt, setAuthUpdatedAt] = useState(0);
  const [tripsMeta, setTripsMeta] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [sortBy, setSortBy] = useState("departure_date");
  const [sortDirection, setSortDirection] = useState("-");

  console.log("authUpdatedAt:", authUpdatedAt.toString());

  // listening for auth completion so we can reload
  useEffect(() => {
    pb.authStore.onChange((token, record) => {
      setAuthUpdatedAt(Date.now()); // force a react refresh
    });
  }, []);

  if (pb.authStore.isValid) {
    return (
      <>
        <img id="background" alt={m["common_strings.background_alt"]()} className={bgClass + " terrabanner"} src={bgURL}></img>
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
              style={{ paddingLeft: "32px", fontSize: "24px", fontWeight: 500 }}
            >
              {m["common_strings.back"]()}
            </p>
            <p
              onClick={() => {
                const confirmationRes = confirm(m["common_strings.log_out_confirm"]());
                if (!confirmationRes) return;
                pb.authStore.clear();
                navigate(0);
              }}
              className="click"
              style={{ paddingRight: "32px", fontSize: "24px", fontWeight: 500 }}
            >
              {m["common_strings.log_out"]()}
            </p>
          </div>
          <section className="section-trainPage">
            <AtlasNav currentRoute={"index"} userData={pb.authStore.record} />
            {tripsMeta && tripsMeta.totalItems > 0 ? (
              <div style={{ display: "flex", columnGap: "12px", rowGap: "0px", flexWrap: "wrap" }}>
                <div>
                  <label>{m["pages.atlas.index.page_selection"]()}</label>
                  <div className="linksJoined">
                    {Array(tripsMeta.totalPages)
                      .fill("amongus")
                      .map((val, i) => {
                        return (
                          <a href="#" onClick={() => {}}>
                            <button
                              className={"joinedLink" + (pageNumber == i + 1 ? " currentlyClickedButton" : "")}
                              onClick={(e) => setPageNumber(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </a>
                        );
                      })}
                    <Link to={"/atlas/add"} replace={true}>
                      <button className="joinedLink">{m["pages.atlas.add_trip"]()}</button>
                    </Link>
                  </div>
                </div>
                <div>
                  <label>{m["pages.atlas.index.sort_by"]()}</label>
                  <div className="linksJoined">
                    {[
                      ["departure_date", m["pages.atlas.index.sort_departure_date"]()],
                      ["length_mi", m["pages.atlas.index.sort_length"]()],
                      ["time_minutes", m["pages.atlas.index.sort_time"]()]
                    ].map((val, i) => {
                      return (
                        <a href="#" onClick={() => {}}>
                          <button
                            className={"joinedLink" + (sortBy == val[0] ? " currentlyClickedButton" : "")}
                            onClick={(e) => setSortBy(val[0])}
                          >
                            {val[1]}
                          </button>
                        </a>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label>{m["pages.atlas.index.sort_direction"]()}</label>
                  <div className="linksJoined" style={{ marginBottom: "8px" }}>
                    {[
                      ["-", m["pages.atlas.index.sort_desc"]()],
                      ["+", m["pages.atlas.index.sort_asc"]()]
                    ].map((val, i) => {
                      return (
                        <a href="#" onClick={() => {}}>
                          <button
                            className={"joinedLink" + (sortDirection == val[0] ? " currentlyClickedButton" : "")}
                            onClick={(e) => setSortDirection(val[0])}
                          >
                            {val[1]}
                          </button>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
            <TripsList
              pb={pb}
              numberOfRecords={50}
              pageNumber={pageNumber}
              setTripsMeta={setTripsMeta}
              sortBy={`${sortDirection}${sortBy}`}
            />
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <img id="background" alt={m["common_strings.background_alt"]()} className={bgClass + " terrabanner"} src={bgURL}></img>
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
            style={{ paddingLeft: "32px", fontSize: "24px", fontWeight: 500 }}
          >
            {m["common_strings.back"]()}
          </p>
        </div>
        <section className="section-trainPage">
          <h1>{m["pages.index.atlas"]()}</h1>
          <details style={{ maxWidth: "500px", marginBottom: "2px" }}>
            <summary style={{ fontSize: "16px", marginBottom: "2px" }}>{m["pages.atlas.note_title"]()}</summary>
            <label>
              <b>{m["pages.atlas.note_bugs"]()}</b> {m["pages.atlas.note_email"]()}{" "}
              <a href="mailto:piero@piemadd.com">piero@piemadd.com</a>. {m["pages.atlas.note_important"]()}{" "}
              <i>
                <b>{m["pages.atlas.note_not_required"]()}</b>
              </i>
              .
            </label>
          </details>
          <button
            className="root"
            onClick={() => {
              if (window.webkit?.messageHandlers) {
                // on the ios app
                (async function () {
                  await pb.collection("users").authWithOAuth2({
                    provider: "google",
                    urlCallback: (url) => {
                      window.webkit?.messageHandlers["open-auth-url"].postMessage(url);
                    }
                  });
                })();
              } else {
                pb.collection("users")
                  .authWithOAuth2({ provider: "google" })
                  .then((authData) => {
                    setAuthUpdatedAt(Date.now());
                  });
              }
            }}
          >
            {m["pages.atlas.index.login_google"]()}
          </button>
          <p>{m["pages.atlas.index.login_divider"]()}</p>
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
              borderRadius: "8px"
            }}
            onClick={(e) => {
              if (window.webkit?.messageHandlers) {
                // on the ios app
                (async function () {
                  await pb.collection("users").authWithOAuth2({
                    provider: "apple",
                    urlCallback: (url) => {
                      window.webkit?.messageHandlers["open-auth-url"].postMessage(url);
                    }
                  });
                })();
              } else {
                pb.collection("users")
                  .authWithOAuth2({ provider: "apple" })
                  .then((authData) => {
                    setAuthUpdatedAt(Date.now());
                  });
              }
            }}
          >
            <AppleLogo style={{ margin: "-16px -8px -18px -16px" }} /> {m["pages.atlas.index.login_apple"]()}
          </button>
          <p>{m["pages.atlas.index.login_divider"]()}</p>
          <label htmlFor="atlas-login_email">{m["pages.atlas.index.email"]()}</label>
          <input
            name="login_email"
            id="atlas-login_email"
            onChange={(e) => setCurrentUsername(e.target.value)}
            value={currentUsername}
            type="email"
          />
          <label htmlFor="atlas-login_password">{m["pages.atlas.index.password"]()}</label>
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
              pb.collection("users")
                .authWithPassword(currentUsername, currentPassword)
                .then((authData) => {
                  setAuthUpdatedAt(Date.now());
                });
            }}
          >
            {m["pages.atlas.index.login_user_pass"]()}
          </button>
        </section>
      </div>
    </>
  );
};

export default AtlasIndex;
