const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkRoles() {
  try {
    const res = await pool.query('SELECT id, name, email, role FROM users');
    console.log('Users:', res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkRoles();
