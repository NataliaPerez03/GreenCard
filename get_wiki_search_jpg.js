const https = require('https');

const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=honey%20jar%20filetype:bitmap&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json`;
https.get(url, { headers: { 'User-Agent': 'GreenCart/1.0' } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const pages = json.query.pages;
    // get first 3 URLs
    Object.keys(pages).slice(0, 3).forEach(pageId => {
       console.log(pages[pageId].imageinfo[0].url);
    });
  });
});
