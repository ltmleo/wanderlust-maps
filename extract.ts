import { regionsGeoJSON, poisGeoJSON } from './src/data/travelData';
import fs from 'fs';

fs.writeFileSync('src/data/regions.json', JSON.stringify(regionsGeoJSON.features, null, 2));
fs.writeFileSync('src/data/pois.json', JSON.stringify(poisGeoJSON.features, null, 2));
console.log("Data extracted successfully to src/data/regions.json and src/data/pois.json");
