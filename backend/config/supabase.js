const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for backend logic

if (!supabaseUrl || !supabaseKey) {
  console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

module.exports = { supabase };
