const generateMarker = (train) => {
  const pixelScale = 4;
  const svgTemplate = `
<svg
  width='${44 * pixelScale}px'
  height='${48 * pixelScale}px'
  viewBox='0 0 176 192'
  fill='none'
  xmlns='http://www.w3.org/2000/svg'
>
  <g>
    <rect
      x='0'
      y='0'
      width='176'
      height='192'
      rx='16'
      fill='black'
    />
    <rect
      x='8'
      y='8'
      width='160'
      height='176'
      rx='10'
      fill='${train.iconColor}'
    />
    <line x1="0" y1="96" x2="176" y2="96" style="stroke:black;stroke-width:8" />
    <text x="88" y="72" fill="white" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="60" letter-spacing="0em" text-anchor="middle">${train.trainNumRaw}</text>
    <text x="88" y="164" fill="white" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="60" letter-spacing="0em" text-anchor="middle">${train.providerShort}</text>
    </g>
</svg>`

  return {
    imageWidth: 44 * pixelScale,
    imageHeight: 48 * pixelScale,
    imageText: svgTemplate,
  }
}

export default generateMarker;