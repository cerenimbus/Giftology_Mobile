const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'assets', 'logo.png');
const dest = path.resolve(__dirname, '..', 'assets', 'applogo.png');

if (!fs.existsSync(src)) {
  console.error('Source logo not found:', src);
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log('Copied', src, '→', dest);
