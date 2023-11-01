const fs = require('fs');
const appConfigPath = './components/config/GeneralConfig.js'; // Update this to the actual path
const majorVersion = 1;
const now = new Date();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');
const version = `${majorVersion}.${month}.${day}${hours}${minutes}`;

const appConfigContent = fs.readFileSync(appConfigPath, 'utf-8');
console.log(appConfigContent);
console.log(version);
const updatedAppConfigContent = appConfigContent.replace(
    /const version = \s*'(.+?)'/,
    `const version = '${version}'`
);

fs.writeFileSync(appConfigPath, updatedAppConfigContent);
