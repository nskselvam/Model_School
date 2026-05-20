const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: '192.168.1.60',
  database: 'Modal_School_Admission_XI',
  password: 'OctaneGel@#2308',
  port: 5432,
});

async function runQuery() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM roll_masters ORDER BY "rollName" LIMIT 10;');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

runQuery();
