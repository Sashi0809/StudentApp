const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    
    // Get existing teachers
    const teachers = await client.query("SELECT id, name, email, subject, department_id FROM users WHERE role = 'TEACHER'");
    console.log("Teachers before update:", teachers.rows);
    
    // Assign a default subject (e.g., 'CSE101') to teachers who don't have one
    await client.query("UPDATE users SET subject = 'CSE101' WHERE role = 'TEACHER' AND (subject IS NULL OR subject = '')");
    
    const teachersAfter = await client.query("SELECT id, name, email, subject, department_id FROM users WHERE role = 'TEACHER'");
    console.log("Teachers after update:", teachersAfter.rows);

  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

run();
