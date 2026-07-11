const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testInsert() {
  try {
    const userRes = await pool.query("SELECT * FROM users WHERE role = 'HOD' LIMIT 1");
    if (userRes.rowCount === 0) {
      console.log('No HOD found');
      return;
    }
    const user = userRes.rows[0];
    console.log('Inserting timetable for department_id:', user.department_id);
    const dbRes = await pool.query(
      'INSERT INTO timetables (department_id, file_path) VALUES ($1, $2) RETURNING *',
      [user.department_id, '/uploads/test.pdf']
    );
    console.log('Insert success:', dbRes.rows[0]);
  } catch (err) {
    console.error('Insert error:', err.message);
  } finally {
    pool.end();
  }
}
testInsert();
