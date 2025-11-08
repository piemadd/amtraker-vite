import BaseButton from "./baseButton";

const ShareButton = ({ navigatorOptions }) => {
  if (!navigatorOptions || (!navigator.share && !navigator.clipboard )) return null;

  return <BaseButton
    symbol="⌲"
    onClick={() => {
      if (navigator.share) navigator.share(navigatorOptions);
      else if (navigator.clipboard) navigator.clipboard.writeText(navigatorOptions.url);
      else return;
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