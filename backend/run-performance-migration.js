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

    // Create student_performance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_performance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        attendance NUMERIC NOT NULL,
        assignment_avg NUMERIC NOT NULL,
        mid_marks NUMERIC NOT NULL,
        internal_marks NUMERIC NOT NULL,
        subject_difficulty NUMERIC NOT NULL,
        previous_cgpa NUMERIC DEFAULT 0,
        predicted_pass_percentage NUMERIC,
        final_score NUMERIC,
        shared_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, teacher_id)
      );
    `);
    console.log('Created student_performance table');

    // Create complaints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hod_id UUID REFERENCES users(id) ON DELETE SET NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created complaints table');

    // Create meetings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic TEXT,
        scheduled_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'REQUESTED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created meetings table');

    // Create cgpa_records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cgpa_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        hod_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cgpa NUMERIC NOT NULL,
        academic_year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created cgpa_records table');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();
