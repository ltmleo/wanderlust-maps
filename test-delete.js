import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    const { data: regions } = await supabase.from('regions').select('id').limit(1);
    if (!regions || regions.length === 0) {
        console.log('No regions found');
        return;
    }
    const id = regions[0].id;
    console.log('Trying to delete region:', id);
    const { data, error } = await supabase.from('regions').delete().eq('id', id).select('*');
    console.log('Data:', data);
    console.log('Error:', error);
}

testDelete();
