const fs = require('fs');
const files = [
  'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx',
  'C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/TvDisplay.jsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/mídiaType/g, 'mediaType');
  content = content.replace(/MídiaType/g, 'mediaType');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed mediaType bug!');
