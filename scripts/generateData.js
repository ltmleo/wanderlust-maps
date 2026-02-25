import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // fallback

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY is missing. The AI generation will fail.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper to delay execution (rate limiting for Nominatim)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchCoordinates(placeName, fetchPolygon = false, retries = 3) {
    for (let i = 0; i < retries; i++) {
        await delay(1500); // strictly respect Nominatim's 1 request/sec policy BEFORE fetching
        try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1${fetchPolygon ? '&polygon_geojson=1' : ''}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': `WanderlustMapsBot/1.0 (contact@your-domain.com)`
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        geojson: data[0].geojson || null
                    };
                }
            } catch (e) {
                console.error(`Fetch coordinates parsing error for ${placeName}. Response was: ${text.substring(0, 100)}...`);
            }
            return null; // Return null if response parses but is empty
        } catch (err) {
            console.warn(`Attempt ${i + 1} failed to fetch coordinates for ${placeName}: ${err.message}`);
            if (i === retries - 1) {
                console.error(`Gave up fetching coordinates for ${placeName} after ${retries} attempts.`);
            } else {
                await delay(2000); // Backoff before retry
            }
        }
    }
    return null;
}

// ---------------- GENERATION PROMPTS ---------------- //

const REGION_LIST_PROMPT = `You are a travel expert planning to add new regions to a map. Return a JSON array of 3 distinct, highly sought-after global travel regions (e.g. "Tuscany, Italy", "Kyoto Prefecture, Japan"). Return ONLY the array of strings.`;

const REGION_INFO_PROMPT = `You are a travel data assistant. I need to create a JSON object for a Region.
Return ONLY valid JSON matching this exact schema:
{
  "properties": {
    "id": "kebab-case-region-name",
    "name": "English Name",
    "namePt": "Portuguese Name",
    "country": "Country Name",
    "description": "Short description in English",
    "descriptionPt": "Short description in Portuguese",
    "monthlyData": {
      "1": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "2": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "3": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "4": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "5": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "6": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "7": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "8": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "9": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "10": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "11": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" },
      "12": { "weatherScore": 8, "costScore": 5, "recommendedScore": 7, "weatherDesc": "Cold", "weatherDescPt": "Frio", "avgDailyCost": 150, "highlights": ["Snow"], "highlightsPt": ["Neve"], "whyVisit": "Skiing", "whyVisitPt": "Esquiar" }
    }
  }
}
Generate for: `;

const REGION_POIS_LIST_PROMPT = `You are a travel expert mapping a region. For the given region, return a JSON array of 5 highly sought-after tourist attractions (POIs) that are located strictly inside this region. Return ONLY the array of strings (e.g. ["Eiffel Tower", "Louvre Museum"]). Region: `;

const POI_INFO_PROMPT = `You are a travel data assistant. I need to create a JSON object for a Point of Interest (POI).
Return ONLY valid JSON matching this schema:
{
  "properties": {
    "id": "kebab-case-name",
    "name": "English Name",
    "namePt": "Portuguese Name",
    "description": "Short description in English",
    "descriptionPt": "Short description in Portuguese",
    "bestTime": "Best time of day or season to visit",
    "bestTimePt": "Best time in Portuguese",
    "category": "landmark" | "nature" | "culture" | "beach" | "city" | "wonder" | "natural_wonder",
    "priority": 5, // 0 for Global Icons, 1-2 for High Relevance, 5 for Medium, >5 for minor
    "caraiqbonito": false // true if there are viral visual videos about it
  }
}
Generate for: `;

// ---------------- GENERATION LOGIC ---------------- //

async function callGemini(promptText, retries = 5) {
    for (let i = 0; i < retries; i++) {
        await delay(4500); // Respect Gemini Free Tier (15 RPM -> 1 req every 4s)
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(promptText);
            let text = result.response.text();
            // Sometimes the model wraps the response in markdown blocks even with JSON mimeType
            text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
            return JSON.parse(text);
        } catch (e) {
            console.warn(`Gemini API call failed (Attempt ${i + 1}/${retries}): ${e.message}`);
            if (i === retries - 1) throw e;
            console.log(`Waiting 60 seconds before retrying Gemini...`);
            await delay(60000); // Wait 60s if rate limited
        }
    }
}

async function processRegion(regionName) {
    console.log(`\n🌎 Generating Region: ${regionName}...`);

    // 1. Get Coordinates & Polygon Outline
    const coords = await fetchCoordinates(regionName, true);
    if (!coords) {
        console.warn(`Could not find geodata for region ${regionName}. Skipping.`);
        return;
    }
    await delay(1000); // rate limit

    // 2. Get Region Info from Gemini
    let regionData;
    try {
        regionData = await callGemini(REGION_INFO_PROMPT + regionName);
        if (Array.isArray(regionData)) regionData = regionData[0]; // defensive check
    } catch (e) {
        console.warn(`Failed to generate info for region ${regionName}`, e);
        return;
    }

    if (!regionData || !regionData.properties) {
        console.warn(`⚠️ Invalid AI data structure for region ${regionName}. Raw response may have been malformed.`);
        return;
    }

    const regionFeature = {
        type: "Feature",
        geometry: coords.geojson || {
            type: "Point",
            coordinates: [coords.lng, coords.lat]
        }, // fallback to point if poly fails
        properties: regionData.properties
    };

    // Save Region
    const regionFolder = path.resolve(__dirname, '../src/data/regions');
    if (!fs.existsSync(regionFolder)) fs.mkdirSync(regionFolder, { recursive: true });

    const regionFilename = `${regionData.properties.id}.json`;
    fs.writeFileSync(path.join(regionFolder, regionFilename), JSON.stringify([regionFeature], null, 2), 'utf8');
    console.log(`✅ Saved Region data to src/data/regions/${regionFilename}`);

    // 3. Get POIs for this Region
    console.log(`   📍 Generating POIs for Region: ${regionName}...`);
    let poisArray;
    try {
        poisArray = await callGemini(REGION_POIS_LIST_PROMPT + regionName);
    } catch (e) {
        console.warn(`Failed to generate POI list for region ${regionName}`, e);
        return;
    }

    // Process each POI
    for (const poiName of poisArray) {
        await processPOI(poiName, regionName);
    }
}

async function processPOI(poiName, regionName) {
    const fullPoiName = `${poiName}, ${regionName}`; // Add context to geocoder
    console.log(`      Generating POI: ${poiName}...`);

    const coords = await fetchCoordinates(fullPoiName);
    if (!coords) {
        console.warn(`      ⚠️ Could not find coordinates for ${fullPoiName}. Skipping.`);
        return;
    }
    await delay(1000);

    let poiData;
    try {
        poiData = await callGemini(POI_INFO_PROMPT + fullPoiName);
        if (Array.isArray(poiData)) poiData = poiData[0]; // defensive check
    } catch (e) {
        console.warn(`      ⚠️ Failed to generate info for POI ${fullPoiName}`, e);
        return;
    }

    if (!poiData || !poiData.properties || !poiData.properties.id) {
        console.warn(`      ⚠️ Invalid AI data structure for POI ${fullPoiName}. Skipping.`);
        return;
    }

    const feature = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [coords.lng, coords.lat]
        },
        properties: poiData.properties
    };

    // Save POI
    const folder = path.resolve(__dirname, '../src/data/pois');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const filename = `${poiData.properties.id}.json`;
    fs.writeFileSync(path.join(folder, filename), JSON.stringify([feature], null, 2), 'utf8');
    console.log(`      ✅ Saved POI data to src/data/pois/${filename}`);
}

async function run() {
    console.log("Starting Hierarchical Data Generation...");

    // 1. Generate List of Regions
    let regions;
    try {
        console.log("Asking Gemini for 3 regions to generate...");
        regions = await callGemini(REGION_LIST_PROMPT);
    } catch (err) {
        console.error("Failed to generate autonomous region list. Using default.");
        regions = ["Andalusia, Spain", "Kyoto Prefecture, Japan"];
    }

    // 2. Loop over regions
    for (const region of regions) {
        await processRegion(region);
    }

    console.log("\n🎉 Finished generating all data. It is saved in the src/data/ folders for your review.");
    console.log("When you are ready to upload, manually run: node scripts/seedDatabase.js");
}

run();
