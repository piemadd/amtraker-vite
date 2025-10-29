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

  if (!pathname.startsWith('/trains')) return res; // not entirely sure how we got here tbh
  if (pathname.endsWith('trains')) return res; // no station specified

  let code = pathname.replace('/trains/', '').replaceAll('/', '-');
  let ogtag

  const infoRes = await fetch(`http://api-beta.amtraker.com/v3/trains/${code}`);
  const infoDataRaw = await infoRes.text();

  if (infoDataRaw == 'Not found') return res; // doesnt exist

  let infoData = JSON.parse(infoDataRaw);

  if (Array.isArray(infoData) && infoData.length == 0) return res; // doesnt exist

  infoData = infoData[code.split('-')[0]][0];

  // these are the metatags we want to inject into the site
  ogtag = `
    <meta property="og:title" content="${infoData.routeName} (${infoData.trainNum}) | Amtraker" />
    <meta property="og:description" content="Track the ${infoData.routeName} on Amtraker!" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="https://ogimg.transitstat.us/images?service=amtraker&type=train&code=${code}" />

    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />

    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${request.url}">
    <meta name="twitter:title" content="${infoData.routeName} (${infoData.trainNum}) | Amtraker">
    <meta name="twitter:description" content="Track the ${infoData.routeName} on Amtraker!">
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
