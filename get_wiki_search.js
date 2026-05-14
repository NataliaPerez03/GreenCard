const https = require('https');

const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=honey%20jar&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json`;
https.get(url, { headers: { 'User-Agent': 'GreenCart/1.0' } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const pages = json.query.pages;
    const pageId = Object.keys(pages)[0];
    console.log(pages[pageId].imageinfo[0].url);
  });
});
