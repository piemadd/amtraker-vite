import BaseButton from "./baseButton";

const ShareButton = ({ navigatorOptions }) => {
  //if (!navigator.share || !navigatorOptions) return null;

  return <BaseButton 
    symbol="⌲"
    onClick={() => {
      navigator.share(navigatorOptions);
    }}
    otherCssStyles={{
      height: '75%',
      fontSize: '20px',
      lineHeight: '20px',
      paddingTop: 'calc(0.5em - 2px)'
    }}
  />

  return <h2
    onClick={() => {
      navigator.share(navigatorOptions);
    }}
    className='click'
  >
    Share
  </h2>
};

export default ShareButton;