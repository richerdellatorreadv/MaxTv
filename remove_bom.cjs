const fs = require('fs');

function removeBOM(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    fs.writeFileSync(filePath, buf.slice(3));
    console.log(`Removed BOM from ${filePath}`);
  } else {
    console.log(`No BOM found in ${filePath}`);
  }
}

removeBOM('C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/Dashboard.jsx');
removeBOM('C:/Users/Richer.DESKTOP-9F3B6VA/Documents/TvMax/src/pages/TvDisplay.jsx');
