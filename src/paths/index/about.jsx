import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import settingsInit from "../../components/settingsInit";
import stringToHash from "../../components/money/stringToHash";

const About = () => {
  const navigate = useNavigate();

  document.title = "About - Amtraker";

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");

  const initialSettings = useMemo(settingsInit, []);
  const [currentSettings, setCurrentSettings] = useState(initialSettings);

  const handleSettingsUpdate = (key, value) => {
    const newSettings = {
      ...currentSettings,
      [key]: value,
    };

    setCurrentSettings(newSettings);

    localStorage.setItem("amtraker-v3-settings", JSON.stringify(newSettings));

    console.log("Updated settings:", newSettings);
  };

  useEffect(() => {
    stringToHash(localStorage.getItem("passphrase")).then((hash) => {
      if (
        hash ==
          "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3" ||
        hash ==
          "ea0fc47b2284d5e8082ddd1fb0dfee5fa5c9ea7e40c5710dca287c9be5430ef3"
      ) {
        setBGURL("/content/images/prideflag.jpg");
        setBGClass("bg-focus-in peppino");
      }
    });

    //scrolling to element id in hash because its broken, likely cuz of react router idk
    const urlHash = window.location.hash.substring(1);
    if (urlHash.length > 0) {
      const idElement = document.getElementById(
        window.location.hash.substring(1),
      );

      if (idElement) idElement.scrollIntoView();
    }
  }, []);

  return (
    <>
      <img
        id="backgroundNew"
        alt="Map of Australia."
        className={"bg-focus-in peppino"}
        src={"/content/images/waow.png"}
      ></img>
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
        <section className="section-trainPage section-settings">
          <h1>About Amtraker</h1>
          <h2>FAQs</h2>
          <ul>
            <li id="faq-what-is-amtraker">
              <h3>What is Amtraker?</h3>
              <ul>
                <li>
                  Amtraker is a website and app that allows you to track Amtrak
                  trains in real time.
                </li>
              </ul>
            </li>
            <li id="faq-data-source">
              <h3>Where does your data come from?</h3>
              <ul>
                <li>
                  Amtraker pulls its data from multiple sources and and rehosts
                  it on our servers. The list of data providers includes, but is
                  not limited to:
                  <ul>
                    <li>
                      <a
                        href="https://github.com/protomaps/basemaps"
                        target="_blank"
                      >
                        Protomaps
                      </a>{" "}
                      - Built Map Archives
                    </li>
                    <li>
                      <a href="https://openstreetmap.org" target="_blank">
                        OpenStreetMap
                      </a>{" "}
                      - General Map Data (Streets, Buildings, Cities, etc)
                    </li>
                    <li>
                      <a href="https://overturemaps.org" target="_blank">
                        Overture Maps Foundation
                      </a>{" "}
                      - General Map Data (Land, Oceans, etc)
                    </li>
                    <li>
                      <a
                        href="https://geodata.bts.gov/datasets/usdot::amtrak-routes/about"
                        target="_blank"
                      >
                        USDOT BTS
                      </a>{" "}
                      - Most Amtrak Map Lines
                    </li>
                    <li>
                      <a
                        href="https://www.amtrak.com/track-your-train.html"
                        target="_blank"
                      >
                        Amtrak
                      </a>{" "}
                      - Some Map Lines, Train Data
                    </li>
                    <li>
                      <a href="http://feed.gobrightline.com/" target="_blank">
                        Brightline
                      </a>{" "}
                      - Train Data and Platform Numbers
                    </li>
                    <li>
                      <a
                        href="https://www.viarail.ca/en/developer-resources"
                        target="_blank"
                      >
                        VIA Rail
                      </a>{" "}
                      - Train Data
                    </li>
                    <li>
                      <a
                        href="https://developer.njtransit.com/terms/"
                        target="_blank"
                      >
                        NJT
                      </a>{" "}
                      - Some NEC Platform Data
                    </li>
                    <li>
                      <a
                        href="https://metrolinktrains.com/about/gtfs/gtfs-rt-access/"
                        target="_blank"
                      >
                        LA Metrolink
                      </a>{" "}
                      - LA Area Platform Data
                    </li>
                    <li>
                      <a href="https://moynihantrainhall.nyc/" target="_blank">
                        NY Moynihan
                      </a>{" "}
                      - NYP Platform Data (When available - tends to be more
                      accurate than NJT)
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li id="faq-dev">
              <h3>Can I use your data?</h3>
              <ul>
                <li>
                  Yes! Amtraker's data is available for use for free, as long as
                  you don't spam the API ofc. You can find the API documentation{" "}
                  <a href="https://github.com/piemadd/amtrak">here</a>. Let me
                  know any issues you have with the API by emailing me at{" "}
                  <a href="mailto:amtraker@piemadd.com">amtraker@piemadd.com</a>
                  .
                </li>
              </ul>
            </li>
            <li id="faq-installing">
              <h3>Can I install Amtraker as an App?</h3>
              <ul>
                <li>
                  This depends on what device you're using. If you're using an
                  Android device, head on over to{" "}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.amtrak.piero"
                    target="_blank"
                  >
                    Google Play
                  </a>{" "}
                  and if you're on an Apple device head over to{" "}
                  <a
                    href="https://apps.apple.com/us/app/amtraker-track-amtrak-via/id6758903803"
                    target="_blank"
                  >
                    the App Store
                  </a>
                  .
                </li>
              </ul>
            </li>
            <li id="faq-feedback">
              <h3>
                How can I give feedback, report a bug, and/or request a feature?
              </h3>
              <ul>
                <li>
                  You can email me at{" "}
                  <a href="mailto:amtraker@piemadd.com">amtraker@piemadd.com</a>
                  , or you can submit feedback via the{" "}
                  <a
                    href="https://forms.gle/Fp6fVc2wqVLZKXKq9"
                    target="__blank"
                  >
                    Google Form
                  </a>
                  .
                </li>
              </ul>
            </li>
            <li id="faq-stale">
              <h3>What does it mean when the data is stale?</h3>
              <ul>
                <li>
                  When, on average, Amtrak hasn't updated their tracking data
                  for more than 15 minutes, the data is outdated and inaccurate.
                  This is usually due to Amtrak's servers having issues.
                </li>
              </ul>
            </li>
            <li id="faq-not-tracking">
              <h3>Why isn't my train tracking?</h3>
              <ul>
                <li>
                  Amtraker only shows the data available to it. If Amtrak isn't
                  tracking your train, Amtraker won't be able to either. If the
                  train, for whatever reason, is tracking on the official
                  tracker, but not on Amtraker, please{" "}
                  <a href="mailto:amtraker@piemadd.com">email me</a> and I'll
                  look as soon as I can.
                </li>
              </ul>
            </li>
            <li id="faq-map-icons-colors">
              <h3>What do the train icons/colors mean?</h3>
              <ul>
                <li>
                  The colors of the icons are broken down into two categories:
                  active and inactive trains.{" "}
                </li>
                <li>
                  Any train that has not yet departed its initial terminal, has
                  arrived at its final station, or has been cancelled is
                  inactive and will be dark grey, as shown below.
                  <br />
                  <svg
                    width="130px"
                    height="60px"
                    viewBox="0 0 208 96"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g>
                      <rect
                        x="0"
                        y="0"
                        width="208"
                        height="96"
                        rx="16"
                        fill="black"
                      />
                      <rect
                        x="8"
                        y="8"
                        width="192"
                        height="80"
                        rx="10"
                        fill="#212529"
                      />
                      <text
                        x="104"
                        y="68"
                        fill="white"
                        xmlSpace="preserve"
                        style={{
                          whiteSpace: "pre",
                        }}
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
                  Otherwise, the shade of the train depends on how late it is,
                  from a green for 0% late, to a an orange for 25% late, and a
                  bright red for 100% late, with these percentegaes being of a
                  predetermined threshold (see below) depending on the route
                  length and type.
                  <ul>
                    <li>
                      Green (0%) HSV(132&deg;, 69%, 54%):
                      <br />
                      <svg
                        width="130px"
                        height="60px"
                        viewBox="0 0 208 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect
                            x="0"
                            y="0"
                            width="208"
                            height="96"
                            rx="16"
                            fill="black"
                          />
                          <rect
                            x="8"
                            y="8"
                            width="192"
                            height="80"
                            rx="10"
                            fill="#2b8a3e"
                          />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{
                              whiteSpace: "pre",
                            }}
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
                      Orange (25%) HSV(35&deg;, 93%, 78%):
                      <br />
                      <svg
                        width="130px"
                        height="60px"
                        viewBox="0 0 208 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect
                            x="0"
                            y="0"
                            width="208"
                            height="96"
                            rx="16"
                            fill="black"
                          />
                          <rect
                            x="8"
                            y="8"
                            width="192"
                            height="80"
                            rx="10"
                            fill="#c77a0e"
                          />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{
                              whiteSpace: "pre",
                            }}
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
                      Red (100%) HSV(-12&deg;, 94%, 78%):
                      <br />
                      <svg
                        width="130px"
                        height="60px"
                        viewBox="0 0 208 96"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <rect
                            x="0"
                            y="0"
                            width="208"
                            height="96"
                            rx="16"
                            fill="black"
                          />
                          <rect
                            x="8"
                            y="8"
                            width="192"
                            height="80"
                            rx="10"
                            fill="#c70c31"
                          />
                          <text
                            x="104"
                            y="68"
                            fill="white"
                            xmlSpace="preserve"
                            style={{
                              whiteSpace: "pre",
                            }}
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
                      To help differentiate the colors for those with
                      deuteranopia and protanopia, I have made the saturation
                      and brightness of the colors go up with the percentage, so
                      while not perfect, there should be some level of
                      differentation between the hues. If you have any
                      feedback/ideas for how I can improve this, please let me
                      know.
                    </li>
                  </ul>
                </li>
                <li>
                  For each route, the maximum lateness threshold largely depends
                  on what type of route it is and who is operating said train.
                  <ul>
                    <li>
                      All Via Corridor, Acela, Brightline, and any Amtrak trains
                      &lt;250mi: 60min / 1hr
                    </li>
                    <li>Amtrak trains 250mi - 349mi: 90min / 1.5hr</li>
                    <li>Amtrak trains 350mi - 449mi: 120min / 2hr</li>
                    <li>Amtrak trains 450mi+: 150min / 2.5hr</li>
                    <li>Any other Via Trains: 360min / 6hr</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <hr
            style={{
              width: "100%",
              marginTop: "4px",
              marginBottom: "12px",
              border: "1px solid grey",
            }}
          />
          <h1 id="settings">Amtraker Settings</h1>
          <p>
            Use this page to adjust various settings for Amtraker. More settings
            will be added over time.
          </p>
          <h2>Map View</h2>
          <p>
            Whether you'd like the map to use a Globe projection or the
            traditional Web Mercator (flat) projection.
          </p>
          <select
            value={currentSettings.mapView}
            onChange={(e) => handleSettingsUpdate("mapView", e.target.value)}
          >
            <option value="mercator">Web Mercator</option>
            <option value="globe">Globe</option>
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

          <h2>More?</h2>
          <p>
            If you have any feature requests for Amtraker, please send them my
            way via my email:{" "}
            <a href="mailto:amtraker@piemadd.com">amtraker@piemadd.com</a>.
          </p>

          <h2>Debug Info</h2>
          <p>User Agent</p>
          <pre>{navigator.userAgent}</pre>
          <p>Platform:</p>
          <pre>{navigator.platform}</pre>
          <p>OSCPU</p>
          <pre>
            {navigator.oscpu && navigator.oscpu.length > 0
              ? navigator.oscpu
              : "[empty string]"}
          </pre>
          <p>Vendor</p>
          <pre>
            {navigator.vendor && navigator.vendor.length > 0
              ? navigator.vendor
              : "[empty string]"}
          </pre>
          <p>Session Storage</p>
          <pre>{JSON.stringify(sessionStorage, null, 2)}</pre>
          <p>Local Storage</p>
          <pre>{JSON.stringify(localStorage, null, 2)}</pre>
          <hr
            style={{
              width: "100%",
              marginTop: "4px",
              marginBottom: "12px",
              border: "1px solid grey",
            }}
          />
          <h1 id="privacy">Privacy Policy for Amtraker</h1>
          <p>
            This privacy policy applies to the Amtraker app and website
            (amtraker.com) (hereby referred to as "Application") that was
            created by Piero Maddaleni (hereby referred to as "Service
            Provider") as an Open Source service. This service is intended for
            use "AS IS".
          </p>
          <br />
          <h2>Information Collection and Use</h2>
          <p>
            The Application collects information when you download and use it.
            This information may include information such as{" "}
          </p>
          <ul>
            <li>Your device's Internet Protocol address (e.g. IP address)</li>
            <li>
              The pages of the Application that you visit, the time and date of
              your visit, the time spent on those pages
            </li>
            <li>The time spent on the Application</li>
            <li>The operating system you use on your mobile device</li>
          </ul>
          <br />
          <p>
            The Service Provider may use the information you provided to contact
            you for account services, such as password resets, but will not use
            the data.
          </p>
          <br />
          <p>
            For a better experience, while using the Application, the Service
            Provider may require you to provide us with certain personally
            identifiable information, including but not limited to your first
            and last name, email address, and train trips. The information that
            the Service Provider request will be retained by them and used as
            described in this privacy policy.
          </p>
          <br />
          <h2>Log Files</h2>
          <p>
            Amtraker follows a standard procedure of using log files. These
            files log visitors when they visit websites. All hosting companies
            do this and a part of hosting services' analytics. The information
            collected by log files include internet protocol (IP) addresses,
            browser type, Internet Service Provider (ISP), date and time stamp,
            referring/exit pages, and possibly the number of clicks. These are
            not linked to any information that is personally identifiable. The
            purpose of the information is for analyzing trends, administering
            the site, tracking users' movement on the website, and gathering
            demographic information.
          </p>
          <br />
          <h2>Geolocation</h2>
          <p>
            Upon consenting to sharing your location, the application may
            collect your device's location to display on the map. This data does
            not leave your device.
          </p>
          <br />
          <h2>Third Party Access</h2>
          <div>
            <p>
              Please note that the Application utilizes third-party services
              that have their own Privacy Policy about handling data. Below are
              the links to the Privacy Policy of the third-party service
              providers used by the Application:
            </p>
            <ul>
              <li>
                <a
                  href="https://www.google.com/policies/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Play Services, Google Analytics
                </a>
              </li>
            </ul>
          </div>
          <br />
          <p>
            The Service Provider may disclose User Provided and Automatically
            Collected Information:
          </p>
          <ul>
            <li>
              as required by law, such as to comply with a subpoena, or similar
              legal process;
            </li>
            <li>
              when they believe in good faith that disclosure is necessary to
              protect their rights, protect your safety or the safety of others,
              investigate fraud, or respond to a government request;
            </li>
            <li>
              with their trusted services providers who work on their behalf, do
              not have an independent use of the information we disclose to
              them, and have agreed to adhere to the rules set forth in this
              privacy statement.
            </li>
          </ul>
          <p></p>
          <br />
          <h2>Data Retention Policy</h2>
          <p>
            The Service Provider will retain User Provided data for as long as
            you use the Application and for a reasonable time thereafter. If
            you'd like them to delete User Provided Data that you have provided
            via the Application, please contact them at amtraker@piemadd.com and
            they will respond in a reasonable time.
          </p>
          <br />
          <h2>Children</h2>
          <p>
            The Service Provider does not use the Application to knowingly
            solicit data from or market to children under the age of 13.
          </p>
          <div>
            <br />
            <p>
              The Application does not address anyone under the age of 13. The
              Service Provider does not knowingly collect personally
              identifiable information from children under 13 years of age. In
              the case the Service Provider discover that a child under 13 has
              provided personal information, the Service Provider will
              immediately delete this from their servers. If you are a parent or
              guardian and you are aware that your child has provided us with
              personal information, please contact the Service Provider
              (amtraker@piemadd.com) so that they will be able to take the
              necessary actions.
            </p>
          </div>
          <br />
          <h2>Security</h2>
          <p>
            The Service Provider is concerned about safeguarding the
            confidentiality of your information. The Service Provider provides
            physical, electronic, and procedural safeguards to protect
            information the Service Provider processes and maintains.
          </p>
          <br />
          <h2>Changes</h2>
          <p>
            This Privacy Policy may be updated from time to time for any reason.
            The Service Provider will notify you of any changes to the Privacy
            Policy by updating this page with the new Privacy Policy. You are
            advised to consult this Privacy Policy regularly for any changes, as
            continued use is deemed approval of all changes.
          </p>
          <br />
          <p>This privacy policy is effective as of 2025-12-29</p>
          <br />
          <h2>Your Consent</h2>
          <p>
            By using the Application, you are consenting to the processing of
            your information as set forth in this Privacy Policy now and as
            amended by us.
          </p>
          <br />
          <h2>Contact Us</h2>
          <p>
            If you have any questions regarding privacy while using the
            Application, or have questions about the practices, please contact
            the Service Provider via email at amtraker@piemadd.com.
          </p>
        </section>
      </div>
    </>
  );
};

export default About;
