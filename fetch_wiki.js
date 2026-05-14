const https = require('https');
const fs = require('fs');
const path = require('path');

const queries = {
  p3: 'Spirulina',
  p4: 'Manuka honey',
  p6: 'Matcha',
  p7: 'Coconut oil',
  p8: 'Aloe vera',
  p9: 'Quinoa',
  p11: 'Moringa oleifera'
};

const imgDir = path.join(__dirname, 'images');

Object.keys(queries).forEach(id => {
  const query = encodeURIComponent(queries[id]);
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${query}`;
  
  https.get(searchUrl, { headers: { 'User-Agent': 'GreenCartApp/1.0' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const pages = json.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId].original) {
          const imgUrl = pages[pageId].original.source;
          console.log(`Downloading ${id} from ${imgUrl}`);
          https.get(imgUrl, { headers: { 'User-Agent': 'GreenCartApp/1.0' } }, (imgRes) => {
            const file = fs.createWriteStream(path.join(imgDir, `${id}.jpg`));
            imgRes.pipe(file);
            file.on('finish', () => console.log(`Finished ${id}`));
          });
        } else {
          console.log(`No image found for ${id}`);
        }
      } catch (e) {
        console.error(`Error parsing ${id}:`, e);
      }
    });
  });
});
