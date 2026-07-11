const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixRoles() {
  try {
    const res = await pool.query("UPDATE users SET role = 'TEACHER' WHERE UPPER(role) = 'TEACHER'");
    console.log(`Updated ${res.rowCount} users to exact 'TEACHER' role.`);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fixRoles();
