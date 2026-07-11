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

    // Create past semesters
    const pastSemesters = [
      { name: 'Fall 2022', start_date: '2022-08-01', end_date: '2022-12-15' },
      { name: 'Spring 2023', start_date: '2023-01-10', end_date: '2023-05-20' },
      { name: 'Fall 2023', start_date: '2023-08-01', end_date: '2023-12-15' },
      { name: 'Spring 2024', start_date: '2024-01-10', end_date: '2024-05-20' },
    ];

    const semesterIds = [];
    for (const sem of pastSemesters) {
      const res = await client.query(`
        INSERT INTO semesters (name, start_date, end_date, is_active)
        VALUES ($1, $2, $3, false)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [sem.name, sem.start_date, sem.end_date]);

      if (res.rowCount > 0) {
        semesterIds.push(res.rows[0].id);
        console.log(`Created semester ${sem.name}`);
      } else {
        const existing = await client.query('SELECT id FROM semesters WHERE name = $1', [sem.name]);
        if (existing.rowCount > 0) {
          semesterIds.push(existing.rows[0].id);
        }
      }
    }

    // Get all students
    const studentsRes = await client.query(`SELECT id FROM users WHERE role = 'STUDENT'`);
    const students = studentsRes.rows;

    // Get all teachers
    const teachersRes = await client.query(`SELECT id FROM users WHERE role = 'TEACHER'`);
    const teachers = teachersRes.rows;

    if (teachers.length === 0) {
      console.log('No teachers found to assign dummy data. Skipping.');
      return;
    }

    const subjects = ['Data Structures', 'Operating Systems', 'Database Management', 'Computer Networks', 'Machine Learning'];

    // Generate dummy records
    for (const student of students) {
      for (const semId of semesterIds) {
        // Generate 3-5 random subject records for each semester
        const numSubjects = Math.min(Math.floor(Math.random() * 3) + 3, teachers.length);
        
        // Randomly select teachers to assign subjects
        const shuffledTeachers = teachers.sort(() => 0.5 - Math.random());
        const selectedTeachers = shuffledTeachers.slice(0, numSubjects);

        for (let i = 0; i < numSubjects; i++) {
          const teacher = selectedTeachers[i];
          // Since teacher_id + student_id + semester_id is unique, we can only have one record per teacher for a student in a semester
          // So we don't store subject directly in performance, wait, performance doesn't store subject in DB!
          // Ah, in performance.ts, subject is mapped to subject_difficulty. We just store the difficulty.
          
          const attendance = Math.floor(Math.random() * 30) + 70; // 70-100
          const mid_sem_1 = Math.floor(Math.random() * 10) + 5; // 5-15
          const mid_sem_2 = Math.floor(Math.random() * 10) + 5; // 5-15
          const internal_marks = Math.floor(Math.random() * 10) + 10; // 10-20
          const end_sem_marks = Math.floor(Math.random() * 30) + 20; // 20-50
          const subject_difficulty = (Math.random() * 5 + 5).toFixed(1); // 5.0-10.0
          const final_score = mid_sem_1 + mid_sem_2 + internal_marks + end_sem_marks;

          await client.query(`
            INSERT INTO student_performance (
              student_id, teacher_id, semester_id, attendance, assignment_avg, internal_marks, 
              subject_difficulty, shared_at, mid_sem_1, mid_sem_2, end_sem_marks, final_score
            )
            VALUES ($1, $2, $3, $4, 0, $5, $6, CURRENT_TIMESTAMP, $7, $8, $9, $10)
            ON CONFLICT DO NOTHING
          `, [
            student.id, teacher.id, semId, attendance, internal_marks, 
            subject_difficulty, mid_sem_1, mid_sem_2, end_sem_marks, final_score
          ]);
        }
      }
      console.log(`Generated history for student ${student.id}`);
    }

    console.log('Dummy history migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
  }
}

runMigration();
