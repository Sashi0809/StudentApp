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

    // Create semesters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS semesters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created semesters table');

    // Ensure only one semester is active at a time
    await client.query(`
      CREATE OR REPLACE FUNCTION ensure_single_active_semester()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_active = true THEN
          UPDATE semesters SET is_active = false WHERE id <> NEW.id;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS single_active_semester ON semesters;
      
      CREATE TRIGGER single_active_semester
      BEFORE INSERT OR UPDATE ON semesters
      FOR EACH ROW
      EXECUTE FUNCTION ensure_single_active_semester();
    `);
    console.log('Created trigger for active semester');

    // Add semester_id to student_performance
    await client.query(`
      ALTER TABLE student_performance
      ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL;
    `);
    console.log('Added semester_id to student_performance');

    // Change the unique constraint from (student_id, teacher_id) to (student_id, teacher_id, semester_id)
    await client.query(`
      ALTER TABLE student_performance DROP CONSTRAINT IF EXISTS student_performance_student_id_teacher_id_key;
    `);
    
    // Check if the new constraint already exists before adding
    const checkConstraint = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'student_performance' 
      AND constraint_name = 'student_performance_unique_record'
    `);
    
    if (checkConstraint.rowCount === 0) {
      // In case there are NULL semester_ids (from old records), we might have issues creating a unique constraint
      // But we just added it, so it should be fine. Actually, NULL in unique constraint allows duplicates in postgres.
      // So we will just add it.
      await client.query(`
        ALTER TABLE student_performance ADD CONSTRAINT student_performance_unique_record UNIQUE NULLS NOT DISTINCT (student_id, teacher_id, semester_id);
      `);
      console.log('Updated unique constraint on student_performance');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();
