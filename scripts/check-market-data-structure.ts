/**
 * Check what data fields are available in our markets
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDataStructure() {
  const { data, error } = await supabase
    .from('active_week_data')
    .select('*')
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error('❌ Error fetching data');
    return;
  }

  console.log('📊 Sample Market Data Structure:\n');
  console.log('Available Fields:');
  console.log(Object.keys(data[0]).join(', '));
  
  console.log('\n\nFull Sample Record:');
  console.log(JSON.stringify(data[0], null, 2));
  
  if (data[0].platform_data) {
    console.log('\n\nPlatform Data (parsed):');
    console.log(JSON.stringify(data[0].platform_data, null, 2));
  }
}

checkDataStructure();

