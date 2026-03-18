const fs = require('fs');
const path = require('path');

const p = 'C:\\Users\\AP-DEV\\AppData\\Roaming\\npm\\node_modules\\openclaw\\dist\\control-ui\\assets';
const file = path.join(p, 'index-UvgeZ3yV.js');
const content = fs.readFileSync(file, 'utf8');

const matches = content.match(/avatar[^\"]*/g);
if (matches) {
    console.log(matches.join('\n'));
} else {
    console.log('none');
}