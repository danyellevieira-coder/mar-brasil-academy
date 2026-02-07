const { Client } = require('pg');

async function testConnection() {
    const configs = [
        {
            name: 'Pooler Session Mode (5432, Pooler User)',
            connectionString: 'postgresql://postgres.pntkawizkdwflaguubpq:39NDJVGUj8BbxuSG@aws-1-sa-east-1.pooler.supabase.com:5432/postgres'
        },
        {
            name: 'Pooler Transaction Mode (6543, Pooler User)',
            connectionString: 'postgresql://postgres.pntkawizkdwflaguubpq:39NDJVGUj8BbxuSG@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
        }
    ];

    for (const config of configs) {
        console.log(`\n--- Testing: ${config.name} ---`);
        console.log(`URL: ${config.connectionString.replace(/:[^:@]+@/, ':****@')}`);

        const client = new Client({
            connectionString: config.connectionString,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log(`SUCCESS: ${config.name}`);
            const res = await client.query('SELECT NOW()');
            console.log('Result:', res.rows[0]);
            await client.end();
        } catch (err) {
            console.error(`FAILED: ${config.name}`);
            console.error('Error:', err.message);
        }
    }
}

testConnection();
