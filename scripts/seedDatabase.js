import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env relative to script location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // fallback

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// We use the anon key for simplicity since RLS allows inserts by anyone during setup, 
// or ideally you would use the SERVICE_ROLE_KEY to bypass RLS, but we'll try with what we have.
// In our schema, we haven't restricted INSERTs yet, so we'll do that after seeding if needed.
// Actually, our current schema only has SELECT policies. Let's assume we run this with anon key 
// and temporarily disable RLS, or we use Service Role Key. 
// For safety, let's just create a script that expects a SERVICE_ROLE_KEY but falls back to ANON.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Make sure VITE_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY are set.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log('Starting data migration to Supabase...');

    try {
        // 1. Read local JSON files
        const regionsRaw = fs.readFileSync(path.resolve(__dirname, '../src/data/regions.json'), 'utf8');
        const poisRaw = fs.readFileSync(path.resolve(__dirname, '../src/data/pois.json'), 'utf8');

        const regionsData = JSON.parse(regionsRaw);
        const poisData = JSON.parse(poisRaw);

        // 2. Process Regions and Monthly Data
        console.log(`Found ${regionsData.length} predefined regions. Formatting for DB...`);
        const dbRegions = [];
        const dbRegionMonthlyData = [];

        for (const regionFeature of regionsData) {
            const props = regionFeature.properties;

            dbRegions.push({
                id: props.id,
                name: props.name,
                name_pt: props.namePt || null,
                country: props.country,
                description: props.description,
                description_pt: props.descriptionPt || null,
                geometry_geojson: regionFeature.geometry // Store the Polygon
            });

            // Extract monthly data
            if (props.monthlyData) {
                for (const [monthStr, mData] of Object.entries(props.monthlyData)) {
                    dbRegionMonthlyData.push({
                        region_id: props.id,
                        month: parseInt(monthStr),
                        weather_score: mData.weatherScore,
                        cost_score: mData.costScore,
                        recommended_score: mData.recommendedScore,
                        weather_desc: mData.weatherDesc,
                        weather_desc_pt: mData.weatherDescPt || null,
                        avg_daily_cost: mData.avgDailyCost,
                        highlights: mData.highlights || [],
                        highlights_pt: mData.highlightsPt || [],
                        why_visit: mData.whyVisit,
                        why_visit_pt: mData.whyVisitPt || null
                    });
                }
            }
        }

        // 3. Process POIs
        console.log(`Found ${poisData.length} Points of Interest. Formatting for DB...`);
        const dbPois = [];

        for (const poiFeature of poisData) {
            const props = poiFeature.properties;
            // Extract coordinates from GeoJSON Point format [lng, lat]
            const [lng, lat] = poiFeature.geometry.coordinates;

            dbPois.push({
                id: props.id,
                name: props.name,
                name_pt: props.namePt || null,
                description: props.description,
                description_pt: props.descriptionPt || null,
                best_time: props.bestTime,
                best_time_pt: props.bestTimePt || null,
                category: props.category,
                lat: lat,
                lng: lng,
                image_url: props.imageUrl || null,
                image_gallery: props.imageGallery || [],
                caraiqbonito: props.caraiqbonito || false
            });
        }

        // 4. Insert data into Supabase
        // Insert Regions
        console.log(`Inserting ${dbRegions.length} Regions...`);
        const { error: regionErr } = await supabase.from('regions').upsert(dbRegions, { onConflict: 'id' });
        if (regionErr) throw regionErr;

        // Insert Monthly Data
        console.log(`Inserting ${dbRegionMonthlyData.length} Monthly Data records...`);
        // Batch inserts for monthly data to be safe
        const chunkSize = 200;
        for (let i = 0; i < dbRegionMonthlyData.length; i += chunkSize) {
            const chunk = dbRegionMonthlyData.slice(i, i + chunkSize);
            const { error: mdErr } = await supabase.from('region_monthly_data').upsert(chunk, { onConflict: 'region_id,month' });
            if (mdErr) throw mdErr;
        }

        // Insert POIs
        console.log(`Inserting ${dbPois.length} POIs...`);
        const { error: poiErr } = await supabase.from('pois').upsert(dbPois, { onConflict: 'id' });
        if (poiErr) throw poiErr;

        console.log('✅ Migration completed successfully!');

    } catch (err) {
        console.error('❌ Error during migration:', err);
    }
}

seedData();
