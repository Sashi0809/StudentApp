import { Router } from 'express';
import { query } from '../db';
import { authenticate } from '../middleware/auth';


const router = Router();

router.post('/upload', authenticate, async (req, res) => {
  const { user } = req;
  if (user.role !== 'HOD') return res.status(403).json({ error: 'Unauthorized' });

  // For simplicity, we accept an array of objects: { student_email: string, cgpa: number }
  const { records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Expected records array' });
  }

  try {
    // Get active semester
    const semRes = await query('SELECT id FROM semesters WHERE is_active = true LIMIT 1');
    if (semRes.rowCount === 0) {
      return res.status(400).json({ error: 'No active semester found' });
    }
    const semester_id = semRes.rows[0].id;

    let successCount = 0;
    for (const record of records) {
      const { student_email, cgpa } = record;
      // Find student by email
      const studentRes = await query('SELECT id FROM users WHERE email = $1 AND role = $2', [student_email, 'STUDENT']);
      if (studentRes.rowCount > 0) {
        const student_id = studentRes.rows[0].id;
        await query(`
          INSERT INTO cgpa_records (student_id, semester_id, hod_id, cgpa, updated_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (student_id, semester_id) 
          DO UPDATE SET cgpa = EXCLUDED.cgpa, updated_at = CURRENT_TIMESTAMP
        `, [student_id, semester_id, user.id, cgpa]);
        successCount++;
      }
    }

    res.json({ message: `Successfully updated ${successCount} CGPA records` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET records (HOD)
router.get('/', authenticate, async (req, res) => {
  if (req.user.role !== 'HOD') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const q = `
      SELECT cr.*, u.name as student_name, u.email as student_email
      FROM cgpa_records cr
      JOIN users u ON cr.student_id = u.id
    `;
    const dbRes = await query(q);
    res.json(dbRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const dbRes = await query('SELECT ROUND(AVG(cgpa), 2) as cgpa FROM cgpa_records WHERE student_id = $1', [req.user.id]);
    if (dbRes.rowCount === 0 || dbRes.rows[0].cgpa === null) return res.json({ cgpa: null });
    res.json({ cgpa: dbRes.rows[0].cgpa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;