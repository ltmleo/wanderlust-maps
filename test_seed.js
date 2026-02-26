const fs = require('fs');
const path = require('path');

const regionsDir = path.resolve(__dirname, 'src/data/regions');
let regionsData = [];

if (fs.existsSync(regionsDir)) {
    const regionFiles = fs.readdirSync(regionsDir).filter(f => f.endsWith('.json'));
    for (const file of regionFiles) {
        const content = fs.readFileSync(path.join(regionsDir, file), 'utf8');
        try {
            const parsed = JSON.parse(content);
            regionsData = regionsData.concat(parsed);
        } catch (e) {
            console.error("Error parsing", file, e);
        }
    }
}
console.log("Raw regionsData length:", regionsData.length);
if (regionsData.length > 0) {
    console.log("First item type:", typeof regionsData[0]);
    console.log("First item keys:", Object.keys(regionsData[0]));
    if (regionsData[0].properties) {
        console.log("First item id:", regionsData[0].properties.id);
    }
}
