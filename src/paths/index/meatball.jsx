const stringToHash = async (message) => {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

const ICookaDaMeatBall = () => {
  return (
    <div>
      <h1>hi friend of piero</h1>
      <p>to disable ads, enter the super secret passphrase!!!1!!1!!</p>
      <br/>
      <input
        type='text'
        id='passphrase'
        onChange={async (e) => {
          //console.log('event', e)
          console.log("plain value", e.target.value);
          const hashed = await stringToHash(e.target.value);
          console.log("hashed value", hashed);
          localStorage.setItem("passphrase", e.target.value);
        }}
      />
      <br/>
      <br/>
      <button onClick={(e) => {
        localStorage.removeItem("passphrase");
      }}>
        <p>remove passphrase</p>
      </button>
      <button onClick={(e) => {
        localStorage.setItem("passphrase", e.target.value);
        window.location.replace("https://amtraker.com/");
      }}>
        <p>Submit</p>
      </button>
    </div>
  );
};

export default ICookaDaMeatBall;
