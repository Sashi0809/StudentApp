const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testTeacherUpload() {
  try {
    // get a teacher
    const teacherRes = await pool.query("SELECT * FROM users WHERE role = 'TEACHER' LIMIT 1");
    if (teacherRes.rowCount === 0) return console.log('No teacher found');
    const teacher = teacherRes.rows[0];
    
    // get or create a classroom for this teacher
    let classRes = await pool.query("SELECT id FROM classrooms WHERE teacher_id = $1 LIMIT 1", [teacher.id]);
    if (classRes.rowCount === 0) {
       classRes = await pool.query("INSERT INTO classrooms (name, teacher_id, join_code) VALUES ('Test Class', $1, 'ABCDEF') RETURNING id", [teacher.id]);
    }
    const classroomId = classRes.rows[0].id;
    
    // Create token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: teacher.id, role: teacher.role, name: teacher.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );
    
    console.log('Teacher token generated for role:', teacher.role);

    // Create assignment
    const form = new FormData();
    form.append('title', 'Test Assignment');
    form.append('deadline', new Date().toISOString());
    
    const uploadRes = await fetch(`http://localhost:5000/api/classrooms/${classroomId}/assignments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    
    const data = await uploadRes.json();
    console.log('Response status:', uploadRes.status);
    console.log('Response data:', data);

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
testTeacherUpload();
