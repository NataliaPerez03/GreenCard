const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  { id: 'p3', url: 'https://loremflickr.com/600/400/spirulina,powder' },
  { id: 'p4', url: 'https://loremflickr.com/600/400/honey,jar' },
  { id: 'p6', url: 'https://loremflickr.com/600/400/matcha,tea' },
  { id: 'p7', url: 'https://loremflickr.com/600/400/coconut,oil' },
  { id: 'p8', url: 'https://loremflickr.com/600/400/aloe,vera,gel' },
  { id: 'p9', url: 'https://loremflickr.com/600/400/quinoa,grain' },
  { id: 'p11', url: 'https://loremflickr.com/600/400/moringa,powder' }
];

const imgDir = path.join(__dirname, 'images');

urls.forEach(({id, url}) => {
  https.get(url, (res) => {
    // loremflickr returns a 302 redirect
    if (res.statusCode === 302) {
      https.get(res.headers.location, (imgRes) => {
        const file = fs.createWriteStream(path.join(imgDir, `${id}.jpg`));
        imgRes.pipe(file);
        file.on('finish', () => console.log(`Downloaded ${id}`));
      });
    } else {
      console.log(`Failed ${id}`);
    }
  }).on('error', err => console.log(`Error ${id}`, err));
});
