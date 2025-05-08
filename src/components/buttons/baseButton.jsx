const BaseButton = ({
  symbol = ":)",
  onClick = () => console.log('button clicked!'),
  otherCssStyles = {},
}) => {
  return <button
    className='root'
    style={{
      fontSize: '24px',
      width: '48px',
      height: '48px',
      textAlign: 'center',
      lineHeight: '0px',
      ...otherCssStyles,
    }}
    onClick={onClick}
  >{symbol}</button>
};

export default BaseButton;