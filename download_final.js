const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  { id: 'p3', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Spirulina_Powder.jpg' },
  { id: 'p4', url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Manuka_honey.jpg' },
  { id: 'p6', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Matcha_Scoop.jpg' },
  { id: 'p7', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Coconut_and_oil.jpg' },
  { id: 'p8', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Aloe_vera_flower_inset.png' },
  { id: 'p9', url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Reismelde.jpg' },
  { id: 'p11', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/DrumstickFlower.jpg' }
];

const imgDir = path.join(__dirname, 'images');

urls.forEach(({id, url}) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301) {
      const imgRes = res.statusCode === 200 ? res : null;
      if (imgRes) {
        const file = fs.createWriteStream(path.join(imgDir, `${id}.jpg`));
        imgRes.pipe(file);
        file.on('finish', () => console.log(`Downloaded ${id}`));
      } else {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (imgRes2) => {
          const file = fs.createWriteStream(path.join(imgDir, `${id}.jpg`));
          imgRes2.pipe(file);
          file.on('finish', () => console.log(`Downloaded ${id} via redirect`));
        });
      }
    } else {
      console.log(`Failed ${id}: ${res.statusCode}`);
    }
  }).on('error', err => console.log(`Error ${id}`, err));
});
