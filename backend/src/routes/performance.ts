import { Router } from 'express';
import { query } from '../db';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = Router();

// Run prediction python script
const runPrediction = async (data: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../ml/predict_json.py');
    const pythonProcess = spawn('python', [pythonScript]);

    let result = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
      }
      try {
        const parsed = JSON.parse(result);
        if (parsed.error) return reject(new Error(parsed.error));
        resolve(parsed.predicted_passing_percentage);
      } catch (e) {
        reject(new Error('Failed to parse ML output: ' + result));
      }
    });

    // Write input JSON to stdin
    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();
  });
};

// Teacher saves performance data
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { user } = req;
  if (user.role !== 'TEACHER') return res.status(403).json({ error: 'Unauthorized' });

  const { student_id, attendance, assignment_avg, mid_marks, internal_marks, subject } = req.body;
  if (!student_id || attendance == null || assignment_avg == null || mid_marks == null || internal_marks == null || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Map subject to difficulty
  let subject_difficulty = 5.0; // default
  try {
    const difficultiesPath = path.join(__dirname, '../../ml/subject_difficulties.json');
    const difficulties = JSON.parse(fs.readFileSync(difficultiesPath, 'utf8'));
    if (difficulties[subject]) {
      subject_difficulty = difficulties[subject];
    }
  } catch (err) {
    console.error('Could not load subject difficulties:', err);
  }

  try {
    // Get active semester
    const semRes = await query('SELECT id FROM semesters WHERE is_active = true LIMIT 1');
    if (semRes.rowCount === 0) {
      return res.status(400).json({ error: 'No active semester to record performance against' });
    }
    const semester_id = semRes.rows[0].id;

    // Get student's previous CGPA
    const cgpaRes = await query('SELECT cgpa FROM cgpa_records WHERE student_id = $1', [student_id]);
    const previous_cgpa = cgpaRes.rowCount > 0 ? cgpaRes.rows[0].cgpa : 0;

    // Call Python ML script
    const inputData = {
      attendance: Number(attendance),
      assignment_avg: Number(assignment_avg),
      mid_marks: Number(mid_marks),
      internal_marks: Number(internal_marks),
      subject_difficulty: Number(subject_difficulty),
      previous_cgpa: Number(previous_cgpa)
    };
    
    let predicted_pass_percentage = null;
    try {
      predicted_pass_percentage = await runPrediction(inputData);
    } catch (mlErr: any) {
      console.error('ML Prediction Error:', mlErr);
      return res.status(500).json({ error: 'Failed to run ML prediction', details: mlErr.message });
    }

    // Save to DB
    const insertRes = await query(`
      INSERT INTO student_performance (student_id, teacher_id, semester_id, attendance, assignment_avg, mid_marks, internal_marks, subject_difficulty, previous_cgpa, predicted_pass_percentage, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id, teacher_id, semester_id) 
      DO UPDATE SET 
        attendance = EXCLUDED.attendance,
        assignment_avg = EXCLUDED.assignment_avg,
        mid_marks = EXCLUDED.mid_marks,
        internal_marks = EXCLUDED.internal_marks,
        subject_difficulty = EXCLUDED.subject_difficulty,
        previous_cgpa = EXCLUDED.previous_cgpa,
        predicted_pass_percentage = EXCLUDED.predicted_pass_percentage,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [student_id, user.id, semester_id, attendance, assignment_avg, mid_marks, internal_marks, subject_difficulty, previous_cgpa, predicted_pass_percentage]);

    res.json(insertRes.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Teacher shares performance
router.post('/:id/share', authenticate, async (req: AuthRequest, res) => {
  const { user } = req;
  const { id } = req.params;
  if (user.role !== 'TEACHER') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const updateRes = await query(`
      UPDATE student_performance 
      SET shared_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND teacher_id = $2 
      RETURNING *
    `, [id, user.id]);

    if (updateRes.rowCount === 0) return res.status(404).json({ error: 'Performance record not found or unauthorized' });

    res.json({ message: 'Performance data shared with student and HOD successfully', data: updateRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student performance (For Students and HODs)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { user } = req;
  const semesterId = req.query.semester_id as string | undefined;

  try {
    let semFilter = '';
    let params: any[] = [];
    
    if (semesterId) {
       semFilter = `AND sp.semester_id = $${user.role === 'HOD' ? 1 : 2}`;
       if (user.role === 'HOD') params.push(semesterId);
       else params = [user.id, semesterId];
    } else {
       // if no semester provided, get active
       const semRes = await query('SELECT id FROM semesters WHERE is_active = true LIMIT 1');
       if (semRes.rowCount > 0) {
         const sid = semRes.rows[0].id;
         semFilter = `AND sp.semester_id = $${user.role === 'HOD' ? 1 : 2}`;
         if (user.role === 'HOD') params.push(sid);
         else params = [user.id, sid];
       } else {
         if (user.role !== 'HOD') params = [user.id];
       }
    }

    if (user.role === 'STUDENT') {
      const q = `
        SELECT sp.*, u.name as teacher_name, sem.name as semester_name 
        FROM student_performance sp
        JOIN users u ON sp.teacher_id = u.id
        LEFT JOIN semesters sem ON sp.semester_id = sem.id
        WHERE sp.student_id = $1 AND sp.shared_at IS NOT NULL ${semFilter}
      `;
      const dbRes = await query(q, params);
      return res.json(dbRes.rows);
    } else if (user.role === 'HOD') {
      const q = `
        SELECT sp.*, s.name as student_name, t.name as teacher_name, sem.name as semester_name 
        FROM student_performance sp
        JOIN users s ON sp.student_id = s.id
        JOIN users t ON sp.teacher_id = t.id
        LEFT JOIN semesters sem ON sp.semester_id = sem.id
        WHERE sp.shared_at IS NOT NULL ${semFilter}
      `;
      const dbRes = await query(q, params);
      return res.json(dbRes.rows);
    } else if (user.role === 'TEACHER') {
      const q = `
        SELECT sp.*, s.name as student_name, sem.name as semester_name 
        FROM student_performance sp
        JOIN users s ON sp.student_id = s.id
        LEFT JOIN semesters sem ON sp.semester_id = sem.id
        WHERE sp.teacher_id = $1 ${semFilter}
      `;
      const dbRes = await query(q, params);
      return res.json(dbRes.rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
