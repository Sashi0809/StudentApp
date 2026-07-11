const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'timetables';
    `);
    console.log('Columns in timetables:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkSchema();
