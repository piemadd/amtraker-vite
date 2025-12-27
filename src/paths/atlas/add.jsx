import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PocketBase from 'pocketbase';
import AtlasNav from "./nav";

const pb = new PocketBase('https://pb.amtraker.com');

const AtlasAdd = () => {
  const navigate = useNavigate();

  const [bgURL, setBGURL] = useState("/content/images/amtraker-back.webp");
  const [bgClass, setBGClass] = useState("bg-focus-in");
  const [disableInputValidation, setDisableInputValidation] = useState(localStorage.getItem('amtraker_atlas_disable_checks') ?? false);
  const [selectedRailroad, setSelectedRailroad] = useState("");
  const [selectedRunNumber, setSelectedRunNumber] = useState("");
  const [selectedStartStation, setSelectedStartStation] = useState("");
  const [selectedEndStation, setSelectedEndStation] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [distanceMi, setDistanceMi] = useState(0);
  const [timeMin, setTimeMin] = useState(0);
  const [loadedAtlasData, setLoadedAtlasData] = useState({
    amtrak: null,
    brightline: null,
    via_rail: null,
  })

  useEffect(() => {
    if (selectedRailroad.length == 0) return;
    if (loadedAtlasData[selectedRailroad]) return; //already loaded
    fetch(`https://store.transitstat.us/atlas_routes/${selectedRailroad}`)
      .then((res) => res.json())
      .then((data) => {
        setLoadedAtlasData({
          ...loadedAtlasData,
          [selectedRailroad]: data,
        })
      })
  }, [selectedRailroad]);

  useEffect(() => {
    if (!loadedAtlasData[selectedRailroad]) return; // no data yet

    const allTripStops = loadedAtlasData[selectedRailroad]
      .routeDataFinal[
      loadedAtlasData[selectedRailroad].tripToRoute[selectedRunNumber]
    ]
      .routeTrips[selectedRunNumber]
      .stoppingPattern;

    const startIndex = allTripStops.indexOf(selectedStartStation);
    const endIndex = allTripStops.indexOf(selectedEndStation);

    let segmentPairs = [];

    for (let i = startIndex; i < endIndex; i++) {
      segmentPairs.push(`${allTripStops[i]}_${allTripStops[i + 1]}`)
    };

    let totalLengthMeters = 0;
    let totalTimeSeconds = 0;

    segmentPairs.forEach((segmentPair) => {
      console.log(segmentPair)
      const thisPair = loadedAtlasData[selectedRailroad].segments[segmentPair];
      totalLengthMeters += thisPair.meters;
      totalTimeSeconds += thisPair.seconds;
    });

    setDistanceMi((totalLengthMeters / 1609.344).toFixed(2));
    setTimeMin((totalTimeSeconds / 60).toFixed(2));

    console.log(selectedRunNumber, selectedStartStation, selectedEndStation, segmentPairs)
  }, [selectedStartStation, selectedEndStation]);



  if (pb.authStore.isValid) {
    console.log("%cHello Developers", 'background-color: darkblue; color: white; font-style: italic; border: 5px solid darkblue; font-size: 2em;');
    console.log("I know you're probably poking around seeing how to add your own records. Please be reponsible and dont make me ban you.");
    //console.log("If you want to add custom records and to turn off checks, you can run `localStorage.amtraker_atlas_disable_checks = true;`");
    console.log("I'm not ensuring your records are valid on the server side (though I am making sure you are adding/modifying/viewing your own records) so you can go wild with nonsensical routes, but do note these *could* break things down the line (they shouldn't though).")

    return (
      <>
        <img
          id='background'
          alt='Amtrak network map.'
          className={bgClass + ' terrabanner'}
          src={bgURL}
        ></img>
        <div className='trainPage'>
          <div className='header-trainpage'>
            <h2
              onClick={() => {
                if (history.state.idx && history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/", { replace: true }); //fallback
                }
              }}
              className='click'
              style={{ paddingLeft: '32px' }}
            >
              Back
            </h2>
          </div>
          <section className='section-trainPage'>
            <AtlasNav currentRoute={'add'} />
            <p>Note: As of now, editing trips are not possible, so please ensure all information is correct. You can always delete a record and make a new one.</p>
            <form style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <label htmlFor="atlas-add-railroad">Railroad</label>
              <select name="railroad" id="atlas-add-railroad" onChange={((e) => {
                setSelectedRailroad(e.target.value)
              })} >
                <option value="">[Select an option]</option>
                <option value="amtrak">Amtrak</option>
                <option value="brightline">Brightline</option>
                <option value="via_rail">VIA Rail</option>
              </select>
              <label htmlFor="atlas-add-train_number">Train Number</label>
              <select name="train_number" id="atlas-add-train_number" onChange={e => setSelectedRunNumber(e.target.value)}>
                {
                  selectedRailroad.length > 0 && loadedAtlasData[selectedRailroad] ? <>
                    <option value="">[Select an option]</option>
                    {
                      Object.keys(loadedAtlasData[selectedRailroad].tripToRoute)
                        .sort((a, b) => a - b)
                        .map((runNumber) => <option value={runNumber}>{runNumber}</option>)
                    }
                  </> : null
                }
              </select>
              <label style={{ maxWidth: '300px' }}>Note: Make sure your start and stop stations are entered in the correct order. Otherwise your total distance and time calculations may be off.</label>
              <label htmlFor="atlas-add-start_code">Start Station</label>
              <select name="start_code" id="atlas-add-start_code" onChange={e => setSelectedStartStation(e.target.value)}>
                {
                  loadedAtlasData[selectedRailroad]?.routeDataFinal[
                    loadedAtlasData[selectedRailroad]?.tripToRoute[selectedRunNumber]
                  ] ? <>
                    <option value="">[Select an option]</option>
                    {
                      loadedAtlasData[selectedRailroad]
                        .routeDataFinal[
                        loadedAtlasData[selectedRailroad].tripToRoute[selectedRunNumber]
                      ]
                        .routeTrips[selectedRunNumber]
                        .stoppingPattern
                        .map((stopCode) => <option value={stopCode}>{loadedAtlasData[selectedRailroad].staticStopsData[stopCode].stopName} ({stopCode})</option>)
                    }
                  </> : null
                }
              </select>
              <label htmlFor="atlas-add-end_code">End Station</label>
              <select name="end_code" id="atlas-add-end_code" onChange={e => setSelectedEndStation(e.target.value)}>
                {
                  loadedAtlasData[selectedRailroad]?.routeDataFinal[
                    loadedAtlasData[selectedRailroad]?.tripToRoute[selectedRunNumber]
                  ] ? <>
                    <option value="">[Select an option]</option>
                    {
                      loadedAtlasData[selectedRailroad]
                        .routeDataFinal[
                        loadedAtlasData[selectedRailroad].tripToRoute[selectedRunNumber]
                      ]
                        .routeTrips[selectedRunNumber]
                        .stoppingPattern
                        .filter((stopCode, i, arr) => i > arr.indexOf(selectedStartStation))
                        .map((stopCode) => <option value={stopCode}>{loadedAtlasData[selectedRailroad].staticStopsData[stopCode].stopName} ({stopCode})</option>)
                    }
                  </> : null
                }
              </select>
              <label htmlFor="atlas-add-departure_date">Departure Date</label>
              <input name="departure_date" id="atlas-add-departure_date" type="date" onChange={e => setDepartureDate(e.target.value)} />

              <label htmlFor="atlas-add-length_mi">Length (mi)</label>
              <input name="departure_date" id="atlas-add-length_mi" disabled value={distanceMi} />

              <label htmlFor="atlas-add-time_min">Time (mi)</label>
              <input name="time_min" id="atlas-add-time_min" disabled value={timeMin} />
            </form>
            {
              selectedRailroad.length > 0 &&
                selectedRunNumber.length > 0 &&
                selectedStartStation.length > 0 &&
                selectedEndStation.length > 0 &&
                departureDate.length > 0 ?
                <button onClick={async () => {
                  const data = {
                    "start_code": selectedStartStation,
                    "end_code": selectedEndStation,
                    "train_number": selectedRunNumber,
                    "railroad": selectedRailroad,
                    "departure_date": departureDate,
                    "user_id": pb.authStore.record.id,
                    "length_mi": distanceMi,
                    "time_minutes": timeMin,
                  };

                  const record = await pb.collection('trips').create(data);
                  navigate('/atlas', { replace: true });
                }}>Submit</button> :
                <button disabled className="disabledButton">Submit</button>
            }
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <img
        id='background'
        alt='Amtrak network map.'
        className={bgClass + ' terrabanner'}
        src={bgURL}
      ></img>
      <div className='trainPage'>
        <div className='header-trainpage'>
          <h2
            onClick={() => {
              if (history.state.idx && history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate("/", { replace: true }); //fallback
              }
            }}
            className='click'
            style={{ paddingLeft: '32px' }}
          >
            Back
          </h2>
        </div>
        <section className='section-trainPage'>
          <h1>Atlas</h1>
          <p>Amtraker Atlas allows you to track your Amtrak, Brightline, and VIA rail trips, similar to Flighty Passport with flights.</p>
          <button className='root' onClick={async () => {
            await pb.collection('users').authWithOAuth2({ provider: 'google' });
          }}>Login With Google</button>
        </section>
      </div>
    </>
  );
};

export default AtlasAdd;