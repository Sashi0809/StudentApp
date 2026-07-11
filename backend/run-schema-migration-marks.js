const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Alter student_performance table to support new marks rubric
    await client.query(`
      ALTER TABLE student_performance 
      DROP COLUMN IF EXISTS mid_marks;
    `);
    console.log('Dropped mid_marks column');

    await client.query(`
      ALTER TABLE student_performance 
      ADD COLUMN IF NOT EXISTS mid_sem_1 NUMERIC,
      ADD COLUMN IF NOT EXISTS mid_sem_2 NUMERIC,
      ADD COLUMN IF NOT EXISTS end_sem_marks NUMERIC;
    `);
    console.log('Added mid_sem_1, mid_sem_2, and end_sem_marks columns');

    // Update assignment_avg if needed (we are relying on internal_marks out of 20, end sem out of 50, mid 1 & 2 out of 15)
    // The previous assignment_avg and internal_marks might need to be kept but we only care about the new structure going forward.

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();
