import { useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";
import { m } from "../../paraglide/messages.js";
import LanguageButtons from "../../components/buttons/languageButtons";
import UnitsButton from "../../components/buttons/unitsButton";

const About = () => {
  const navigate = useNavigate();

  document.title = m["pages.about.page_title"]();
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", m["pages.about.meta_description"]());
  document
    .querySelector('meta[property="og:image"]')
    .setAttribute("content", "https://amtraker.com/content/images/amtraker-back.webp");

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  const initialSettings = useMemo(settingsInit, []);
  const [currentSettings, setCurrentSettings] = useState(initialSettings);

  const handleSettingsUpdate = (key, value) => {
    const newSettings = { ...currentSettings, [key]: value };

    setCurrentSettings(newSettings);

    localStorage.setItem("amtraker-v3-settings", JSON.stringify(newSettings));

    console.log("Updated settings:", newSettings);
  };

  const initialAllSavedtrains = useMemo(() => (localStorage.getItem("alwaysTrackedAmtrakerV3") ?? "").split(",").filter((v) => v.length > 0), []);
  const [alwaysSavedTrains, setAlwaysSavedTrains] = useState(initialAllSavedtrains);

  const handleAlwaysSavedTrainsUpdate = (additions, removals) => {
    setAlwaysSavedTrains((currentAlwaysSavedTrains) => {
      let newAlwaysSavedTrains = [...currentAlwaysSavedTrains, ...additions];

      newAlwaysSavedTrains = newAlwaysSavedTrains.filter(
        (alwaysSavedTrainNumber) => !removals.includes(alwaysSavedTrainNumber)
      );

      const uniqueNumbers = [...new Set(newAlwaysSavedTrains)].filter((v) => v.length > 0);

      localStorage.setItem('alwaysTrackedAmtrakerV3', uniqueNumbers.join(','));

      return uniqueNumbers;
    });
  };

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash == "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
        hash == "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });

    //scrolling to element id in hash because its broken, likely cuz of react router idk
    const urlHash = window.location.hash.substring(1);
    if (urlHash.length > 0) {
      const idElement = document.getElementById(window.location.hash.substring(1));

      if (idElement) idElement.scrollIntoView();
    }
  }, []);

  return (
    <>
      <img id="background" alt={m["common_strings.background_alt"]()} className={bgClass + " terrabanner"} src={bgURL}></img>
      <div className="trainPage">
        <div className="header-trainpage">
          <p
            onClick={() => {
              console.log(history);

              if (history.state && history.state.idx && history.state.idx > 0) {
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
          <div className="multiButtonHolder">
            <UnitsButton headerStyle={true} />
            <LanguageButtons headerStyle={true} />
          </div>
        </div>
        <section className="section-trainPage section-settings">
          <p style={{ marginTop: -8 }}>
            {m["pages.about.sections"]()}{" "}
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => document.getElementById("about-section").scrollIntoView()}
            >
              {m["pages.about.section_about"]()}
            </span>{" "}
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => document.getElementById("settings-section").scrollIntoView()}
            >
              {m["pages.about.section_settings"]()}
            </span>{" "}
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => document.getElementById("privacy-section").scrollIntoView()}
            >
              {m["pages.about.section_privacy"]()}
            </span>
          </p>
          <hr style={{ width: "100%", marginTop: "4px", marginBottom: "12px", border: "1px solid grey" }} />
          <h1 id="about-section">{m["pages.about.about_heading"]()}</h1>
          <h2>{m["pages.about.faqs"]()}</h2>
          <ul>
            <li id="faq-what-is-amtraker">
              <h3>{m["pages.about.faq.what_is_q"]()}</h3>
              <ul>
                <li>{m["pages.about.faq.what_is_a"]()}</li>
              </ul>
            </li>
            <li id="faq-data-source">
              <h3>{m["pages.about.faq.data_source_q"]()}</h3>
              <ul>
                <li>
                  {m["pages.about.faq.data_source_a"]()}
                  <ul>
                    <li>
                      <a href="https://github.com/protomaps/basemaps" target="_blank">
                        Protomaps
                      </a>{" "}
                      - {m["pages.about.faq.data_source_protomaps"]()}
                    </li>
                    <li>
                      <a href="https://openstreetmap.org" target="_blank">
                        OpenStreetMap
                      </a>{" "}
                      - {m["pages.about.faq.data_source_osm"]()}
                    </li>
                    <li>
                      <a href="https://overturemaps.org" target="_blank">
                        Overture Maps Foundation
                      </a>{" "}
                      - {m["pages.about.faq.data_source_overture"]()}
                    </li>
                    <li>
                      <a href="https://geodata.bts.gov/datasets/usdot::amtrak-routes/about" target="_blank">
                        USDOT BTS
                      </a>{" "}
                      - {m["pages.about.faq.data_source_usdot"]()}
                    </li>
                    <li>
                      <a href="https://www.amtrak.com/track-your-train.html" target="_blank">
                        Amtrak
                      </a>{" "}
                      - {m["pages.about.faq.data_source_amtrak"]()}
                    </li>
                    <li>
                      <a href="http://feed.gobrightline.com/" target="_blank">
                        Brightline
                      </a>{" "}
                      - {m["pages.about.faq.data_source_brightline"]()}
                    </li>
                    <li>
                      <a href="https://www.viarail.ca/en/developer-resources" target="_blank">
                        VIA Rail
                      </a>{" "}
                      - {m["pages.about.faq.data_source_via"]()}
                    </li>
                    <li>
                      <a href="https://developer.njtransit.com/terms/" target="_blank">
                        NJT
                      </a>{" "}
                      - {m["pages.about.faq.data_source_njt"]()}
                    </li>
                    <li>
                      <a href="https://metrolinktrains.com/about/gtfs/gtfs-rt-access/" target="_blank">
                        LA Metrolink
                      </a>{" "}
                      - {m["pages.about.faq.data_source_metrolink"]()}
                    </li>
                    <li>
                      <a href="https://moynihantrainhall.nyc/" target="_blank">
                        NY Moynihan
                      </a>{" "}
                      - {m["pages.about.faq.data_source_moynihan"]()}
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li id="faq-dev">
              <h3>{m["pages.about.faq.dev_q"]()}</h3>
              <ul>
                <li>
                  {m["pages.about.faq.dev_a_before_link"]()}{" "}
                  <a href="https://github.com/piemadd/amtrak">{m["pages.about.faq.dev_a_link"]()}</a>
                  {m["pages.about.faq.dev_a_after_link"]()}{" "}
                  <a href="mailto:amtraker@piemadd.com">amtraker@piemadd.com</a>.
                </li>
              </ul>
            </li>
            <li id="faq-installing">
              <h3>{m["pages.about.faq.installing_q"]()}</h3>
              <ul>
                <li>
                  {m["pages.about.faq.installing_a_android"]()}{" "}
                  <a href="https://play.google.com/store/apps/details?id=com.amtrak.piero" target="_blank">
                    {m["pages.about.faq.installing_a_google_play"]()}
                  </a>{" "}
                  {m["pages.about.faq.installing_a_apple"]()}{" "}
                  <a href="https://apps.apple.com/us/app/amtraker-track-amtrak-via/id6758903803" target="_blank">
                    {m["pages.about.faq.installing_a_app_store"]()}
                  </a>
                  .
                </li>
              </ul>
            </li>
            <li id="faq-feedback">
              <h3>{m["pages.about.faq.feedback_q"]()}</h3>
              <ul>
                <li>
                  {m["pages.about.faq.feedback_a_email"]()} <a href="mailto:amtraker@piemadd.com">amtraker@piemadd.com</a>
                  {m["pages.about.faq.feedback_a_form"]()}{" "}
                  <a href="https://forms.gle/Fp6fVc2wqVLZKXKq9" target="__blank">
                    {m["pages.about.faq.feedback_a_form_link"]()}
                  </a>
                  .
                </li>
              </ul>
            </li>
            <li id="faq-stale">
              <h3>{m["pages.about.faq.stale_q"]()}</h3>
              <ul>
                <li>
                  {m["pages.about.faq.stale_a"]()}
                </li>
              </ul>
            </li>
            <li id="faq-not-tracking">
              <h3>{m["pages.about.faq.not_tracking_q"]()}</h3>
              <ul>
                <li>
                  {m["pages.about.faq.not_tracking_a_before_link"]()}{" "}
                  <a href="mailto:amtraker@piemadd.com">{m["pages.about.faq.not_tracking_a_link"]()}</a>{" "}
                  {m["pages.about.faq.not_tracking_a_after_link"]()}
                </li>
              </ul>
            </li>
            <li id="faq-map-icons-colors">
              <h3>{m["pages.about.faq.icons_q"]()}</h3>
              <ul>
                <li>{m["pages.about.faq.icons_a_categories"]()}</li>
                <li>
                  {m["pages.about.faq.icons_a_inactive"]()}
                  <br />
                  <svg width="130px" height="60px" viewBox="0 0 208 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <rect x="0" y="0" width="208" height="96" rx="16" fill="black" />
                      <rect x="8" y="8" width="192" height="80" rx="10" fill="#212529" />
                      <text
                        x="104"
                        y="68"
                        fill="white"
                        xmlSpace="preserve"
                        style={{ whiteSpace: "pre" }}
                        fontFamily="monospace"
                        fontSize="60"
                        letterSpacing="0em"
                        textAnchor="middle"
                      >
                        <tspan fontSize="40">A</tspan>41
                        <tspan fontSize="40">(5)</tspan>
                      </text>
                    </g>
                  </svg>
                </li>
                <li>
                  {m["pages.about.faq.icons_a_active"]()}
                  <ul>
                    <li>
                      {m["pages.about.faq.icons_a_green"]()}
                      <br />
                      <svg
                        width="130px"
                        height="60px"
                        viewBox="0 0 208 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect x="0" y="0" width="208" height="96" rx="16" fill="black" />
                          <rect x="8" y="8" width="192" height="80" rx="10" fill="#2b8a3e" />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{ whiteSpace: "pre" }}
                            fontFamily="monospace"
                            fontSize="60"
                            letterSpacing="0em"
                            textAnchor="middle"
                          >
                            <tspan fontSize="40">A</tspan>41
                            <tspan fontSize="40">(5)</tspan>
                          </text>
                        </g>
                      </svg>
                    </li>
                    <li>
                      {m["pages.about.faq.icons_a_orange"]()}
                      <br />
                      <svg
                        width="130px"
                        height="60px"
                        viewBox="0 0 208 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect x="0" y="0" width="208" height="96" rx="16" fill="black" />
                          <rect x="8" y="8" width="192" height="80" rx="10" fill="#c77a0e" />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{ whiteSpace: "pre" }}
                            fontFamily="monospace"
                            fontSize="60"
                            letterSpacing="0em"
                            textAnchor="middle"
                          >
                            <tspan fontSize="40">A</tspan>41
                            <tspan fontSize="40">(5)</tspan>
                          </text>
                        </g>
                      </svg>
                    </li>
                    <li>
                      {m["pages.about.faq.icons_a_red"]()}
                      <br />
                      <svg
                        width="130px"
                        height="60px"
                        viewBox="0 0 208 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect x="0" y="0" width="208" height="96" rx="16" fill="black" />
                          <rect x="8" y="8" width="192" height="80" rx="10" fill="#c70c31" />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{ whiteSpace: "pre" }}
                            fontFamily="monospace"
                            fontSize="60"
                            letterSpacing="0em"
                            textAnchor="middle"
                          >
                            <tspan fontSize="40">A</tspan>41
                            <tspan fontSize="40">(5)</tspan>
                          </text>
                        </g>
                      </svg>
                    </li>
                    <li>
                      {m["pages.about.faq.icons_a_colorblind"]()}
                    </li>
                  </ul>
                </li>
                <li>
                  {m["pages.about.faq.icons_a_thresholds"]()}
                  <ul>
                    <li>{m["pages.about.faq.icons_a_threshold_short"]()}</li>
                    <li>{m["pages.about.faq.icons_a_threshold_250"]()}</li>
                    <li>{m["pages.about.faq.icons_a_threshold_350"]()}</li>
                    <li>{m["pages.about.faq.icons_a_threshold_450"]()}</li>
                    <li>{m["pages.about.faq.icons_a_threshold_via"]()}</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <hr style={{ width: "100%", marginTop: "4px", marginBottom: "12px", border: "1px solid grey" }} />
          <h1 id="settings-section">{m["pages.about.settings.heading"]()}</h1>
          <p>{m["pages.about.settings.intro"]()}</p>
          <h2>{m["pages.about.settings.map_view"]()}</h2>
          <p>{m["pages.about.settings.map_view_description"]()}</p>
          <select value={currentSettings.mapView} onChange={(e) => handleSettingsUpdate("mapView", e.target.value)}>
            <option value="mercator">{m["pages.about.settings.map_view_mercator"]()}</option>
            <option value="globe">{m["pages.about.settings.map_view_globe"]()}</option>
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

          <h2>{m["pages.about.settings.always_saved"]()}</h2>
          <p>{m["pages.about.settings.always_saved_description"]()}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alwaysSavedTrains.length == 0 ? <button>{m["pages.about.settings.always_saved_none"]()}</button>: null}
            {alwaysSavedTrains.map((alwaysSavedTrainNum) => {
              return (
                <button
                  data-trainnum={alwaysSavedTrainNum}
                  onClick={(e) => {
                    const result =  confirm(m["pages.about.settings.always_saved_delete_confirm"]({ trainNum: alwaysSavedTrainNum }));
                    
                    if (result) handleAlwaysSavedTrainsUpdate([], [e.target.dataset.trainnum]);
                  }}
                >
                  {m["pages.about.settings.always_saved_delete"]({ trainNum: alwaysSavedTrainNum })}
                </button>
              );
            })}
            <button
              onClick={(e) => {
                const userInput = prompt(
                  m["pages.about.settings.always_saved_add_prompt"]()
                );

                if (!userInput) return;

                handleAlwaysSavedTrainsUpdate([userInput], []);
              }}
            >
              {m["pages.about.settings.always_saved_add"]()}
            </button>
          </div>

          <h2>{m["pages.about.settings.debug_info"]()}</h2>
          <p>{m["pages.about.settings.debug_user_agent"]()}</p>
          <pre>{navigator.userAgent}</pre>
          <p>{m["pages.about.settings.debug_platform"]()}</p>
          <pre>{navigator.platform}</pre>
          <p>{m["pages.about.settings.debug_oscpu"]()}</p>
          <pre>{navigator.oscpu && navigator.oscpu.length > 0 ? navigator.oscpu : m["pages.about.settings.debug_empty_string"]()}</pre>
          <p>{m["pages.about.settings.debug_vendor"]()}</p>
          <pre>{navigator.vendor && navigator.vendor.length > 0 ? navigator.vendor : m["pages.about.settings.debug_empty_string"]()}</pre>
          <p>{m["pages.about.settings.debug_session_storage"]()}</p>
          <pre>{JSON.stringify(sessionStorage, null, 2)}</pre>
          <p>{m["pages.about.settings.debug_local_storage"]()}</p>
          <pre>{JSON.stringify(localStorage, null, 2)}</pre>
          <hr style={{ width: "100%", marginTop: "4px", marginBottom: "12px", border: "1px solid grey" }} />
          <h1 id="privacy-section">{m["pages.about.privacy.heading"]()}</h1>
          <p>
            {m["pages.about.privacy.intro"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.collection_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.collection_intro"]()}
          </p>
          <ul>
            <li>{m["pages.about.privacy.collection_ip"]()}</li>
            <li>
              {m["pages.about.privacy.collection_pages"]()}
            </li>
            <li>{m["pages.about.privacy.collection_time"]()}</li>
            <li>{m["pages.about.privacy.collection_os"]()}</li>
          </ul>
          <br />
          <p>
            {m["pages.about.privacy.collection_contact"]()}
          </p>
          <br />
          <p>
            {m["pages.about.privacy.collection_pii"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.log_files_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.log_files_body"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.geolocation_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.geolocation_body"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.third_party_heading"]()}</h2>
          <div>
            <p>
              {m["pages.about.privacy.third_party_body"]()}
            </p>
            <ul>
              <li>
                <a href="https://www.google.com/policies/privacy/" target="_blank" rel="noopener noreferrer">
                  {m["pages.about.privacy.third_party_google"]()}
                </a>
              </li>
            </ul>
          </div>
          <br />
          <p>{m["pages.about.privacy.disclosure_intro"]()}</p>
          <ul>
            <li>{m["pages.about.privacy.disclosure_law"]()}</li>
            <li>
              {m["pages.about.privacy.disclosure_good_faith"]()}
            </li>
            <li>
              {m["pages.about.privacy.disclosure_providers"]()}
            </li>
          </ul>
          <p></p>
          <br />
          <h2>{m["pages.about.privacy.retention_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.retention_body"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.children_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.children_body_1"]()}
          </p>
          <div>
            <br />
            <p>
              {m["pages.about.privacy.children_body_2"]()}
            </p>
          </div>
          <br />
          <h2>{m["pages.about.privacy.security_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.security_body"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.changes_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.changes_body"]()}
          </p>
          <br />
          <p>{m["pages.about.privacy.effective_date"]({ date: "2025-12-29" })}</p>
          <br />
          <h2>{m["pages.about.privacy.consent_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.consent_body"]()}
          </p>
          <br />
          <h2>{m["pages.about.privacy.contact_heading"]()}</h2>
          <p>
            {m["pages.about.privacy.contact_body"]()}
          </p>
        </section>
      </div>
    </>
  );
};

export default About;
