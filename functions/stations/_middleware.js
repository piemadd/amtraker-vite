class ElementHandler {
  constructor(ogtag) {
    this.ogtag = ogtag
  }
  element(element) {
    element.append(this.ogtag, { html: true })
  }
}

class RemoveElement {
  element(element) {
    element.remove();
  }
}

export async function onRequest(context) {
  const { request, next } = context
  const res = await next()
  const { pathname } = new URL(request.url)

  if (!pathname.startsWith('/stations')) return res; // not entirely sure how we got here tbh
  if (pathname.endsWith('stations')) return res; // no station specified

  let code = pathname.split('/').at(-1);
  let ogtag

  const infoRes = await fetch(`http://api.amtraker.com/v3/stations/${code}`);
  const infoDataRaw = await infoRes.text();

  if (infoDataRaw == 'Not found') return res; // doesnt exist

  const infoData = JSON.parse(infoDataRaw);

  if (Array.isArray(infoData) && infoData.length == 0) return res; // doesnt exist

  // these are the metatags we want to inject into the site
  ogtag = `
    <meta property="og:title" content="${infoData[code].name} (${code}) | Amtraker" />
    <meta property="og:description" content="Track trains to and from ${infoData[code].name}!" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="https://ogimg.transitstat.us/images?service=amtraker&type=station&code=${code}" />

    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />

    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${request.url}">
    <meta name="twitter:title" content="${infoData[code].name} (${code}) | Amtraker">
    <meta name="twitter:description" content="Track trains to and from ${infoData[code].name}!">
    <meta name="twitter:image" content="https://ogimg.transitstat.us/images?service=amtraker&type=station&code=${code}">
  `

  return new HTMLRewriter()
    .on('meta[property="og:url"]', new RemoveElement())
    .on('meta[property="og:type"]', new RemoveElement())
    .on('meta[property="og:title"]', new RemoveElement())
    .on('meta[property="og:description"]', new RemoveElement())
    .on('head', new ElementHandler(ogtag))
    .transform(res);
}
