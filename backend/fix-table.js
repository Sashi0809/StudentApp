const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixTable() {
  try {
    await pool.query('DROP TABLE IF EXISTS timetables CASCADE;');
    console.log('Old timetables table dropped');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fixTable();
