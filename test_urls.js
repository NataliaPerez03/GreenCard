const https = require('https');
const urls = [
  'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002',
  'https://images.unsplash.com/photo-1557364667-00508f6d6ab0',
  'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c',
  'https://images.unsplash.com/photo-1563189071-4a574972e01b',
  'https://images.unsplash.com/photo-1559564114-569b04b8af5c'
];

urls.forEach(url => {
  https.get(url, res => {
    console.log(`${url} -> ${res.statusCode}`);
  });
});
