import { Router } from 'express';
import { query } from '../db';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { user } = req;
  if (user.role !== 'STUDENT') return res.status(403).json({ error: 'Unauthorized' });

  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'Description required' });

  try {
    const insertRes = await query(`
      INSERT INTO complaints (student_id, description)
      VALUES ($1, $2)
      RETURNING *
    `, [user.id, description]);
    res.json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const { user } = req;
  try {
    if (user.role === 'HOD') {
      const q = `
        SELECT c.*, s.name as student_name, s.email as student_email 
        FROM complaints c
        JOIN users s ON c.student_id = s.id
        ORDER BY c.created_at DESC
      `;
      const dbRes = await query(q);
      return res.json(dbRes.rows);
    } else if (user.role === 'STUDENT') {
      const q = `SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC`;
      const dbRes = await query(q, [user.id]);
      return res.json(dbRes.rows);
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/resolve', authenticate, async (req: AuthRequest, res) => {
  const { user } = req;
  if (user.role !== 'HOD') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const updateRes = await query(`
      UPDATE complaints 
      SET status = 'RESOLVED', hod_id = $1 
      WHERE id = $2 RETURNING *
    `, [user.id, req.params.id]);
    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
