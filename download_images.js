const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=600&q=80' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1611078505537-88eb74e9f390?auto=format&fit=crop&w=600&q=80' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&w=600&q=80' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1582787030018-7b4d13778216?auto=format&fit=crop&w=600&q=80' },
  { id: 'p7', url: 'https://images.unsplash.com/photo-1610416972045-8b5443fa3055?auto=format&fit=crop&w=600&q=80' },
  { id: 'p8', url: 'https://images.unsplash.com/photo-1596547609652-9cb5d8d736bb?auto=format&fit=crop&w=600&q=80' },
  { id: 'p9', url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=600&q=80' },
  { id: 'p10', url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80' },
  { id: 'p11', url: 'https://images.unsplash.com/photo-1620987309990-2da8e8074d0a?auto=format&fit=crop&w=600&q=80' },
  { id: 'p12', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80' }
];

const imgDir = path.join(__dirname, 'images');
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);

urls.forEach(({id, url}) => {
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(path.join(imgDir, `${id}.jpg`));
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${id}`);
      });
    } else {
      console.log(`Failed ${id}: ${res.statusCode}`);
    }
  }).on('error', (err) => console.error(`Error ${id}:`, err.message));
});
