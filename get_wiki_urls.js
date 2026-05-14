const https = require('https');

const files = [
  'File:Spirulina_powdder_close.jpg',
  'File:Honey_jar.jpg'
];

files.forEach(file => {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(file)}&prop=imageinfo&iiprop=url&format=json`;
  https.get(url, { headers: { 'User-Agent': 'GreenCart/1.0' } }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      const pages = json.query.pages;
      const page = pages[Object.keys(pages)[0]];
      if (page.imageinfo) {
        console.log(file, '->', page.imageinfo[0].url);
      } else {
        console.log(file, '-> Not found');
      }
    });
  });
});
