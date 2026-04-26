require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error listing buckets:', error);
    } else {
        console.log('Buckets:', data.map(b => b.name));
        const versionsBucket = data.find(b => b.name === 'versions');
        if (!versionsBucket) {
            console.log('Bucket "versions" NOT FOUND. Attempting to create it...');
            const { data: createData, error: createError } = await supabase.storage.createBucket('versions', {
                public: true
            });
            if (createError) {
                console.error('Error creating bucket:', createError);
            } else {
                console.log('Bucket "versions" created successfully!');
            }
        } else {
            console.log('Bucket "versions" exists.');
        }
    }
}

checkBuckets();
