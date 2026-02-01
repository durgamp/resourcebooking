import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfwdvmfbabicoptdmjlb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmd2R2bWZiYWJpY29wdGRtamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzY5MTgsImV4cCI6MjA4NTUxMjkxOH0.XpqZfs15eOhlk2Xi9xTmq-bpqR84oYkubpj4wwTurS4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    try {
        // We don't know any tables, so checking auth health or just that we don't get a network error
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Supabase Error:', error.message);
        } else {
            console.log('Supabase initialized successfully. Session check complete (no session expected).');
        }
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

verify();
