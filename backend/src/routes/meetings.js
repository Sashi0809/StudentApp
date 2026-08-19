import { Router } from 'express';
import { query } from '../db';
import { authenticate } from '../middleware/auth';


const router = Router();

router.post('/request', authenticate, async (req, res) => {
  const { user } = req;
  if (user.role !== 'STUDENT') return res.status(403).json({ error: 'Unauthorized' });

  const { teacher_id, topic } = req.body;
  if (!teacher_id) return res.status(400).json({ error: 'Teacher ID required' });

  try {
    const insertRes = await query(`
      INSERT INTO meetings (student_id, teacher_id, topic)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [user.id, teacher_id, topic]);
    res.json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
  const { user } = req;
  try {
    if (user.role === 'TEACHER') {
      const q = `
        SELECT m.*, s.name as student_name, s.email as student_email 
        FROM meetings m
        JOIN users s ON m.student_id = s.id
        WHERE m.teacher_id = $1
        ORDER BY m.created_at DESC
      `;
      const dbRes = await query(q, [user.id]);
      return res.json(dbRes.rows);
    } else if (user.role === 'STUDENT') {
      const q = `
        SELECT m.*, t.name as teacher_name 
        FROM meetings m
        JOIN users t ON m.teacher_id = t.id
        WHERE m.student_id = $1
        ORDER BY m.created_at DESC
      `;
      const dbRes = await query(q, [user.id]);
      return res.json(dbRes.rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  const { user } = req;
  const { status, scheduled_at } = req.body;

  if (user.role !== 'TEACHER') return res.status(403).json({ error: 'Unauthorized' });

  try {
    let q = `UPDATE meetings SET status = $1`;
    let params = [status, req.params.id, user.id];

    if (scheduled_at) {
      q += `, scheduled_at = $4`;
      params.push(scheduled_at);
    }

    q += ` WHERE id = $2 AND teacher_id = $3 RETURNING *`;

    const updateRes = await query(q, params);
    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;