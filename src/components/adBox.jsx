const AdsBox = () => {
  return (
    <div
      className={"station-line"}
      dangerouslySetInnerHTML={{
        __html: `<script type="text/javascript">
      atOptions = {
        'key' : '9dad271020f4eb36e74568ba1aaaac3e',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
      document.write('<scr' + 'ipt type="text/javascript" src="http' + (location.protocol === 'https:' ? 's' : '') + '://www.profitabledisplaynetwork.com/9dad271020f4eb36e74568ba1aaaac3e/invoke.js"></scr' + 'ipt>');
    </script>`,
      }}
    ></div>
  );
};

export default AdsBox;
