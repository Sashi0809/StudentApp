import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (user.role === 'TEACHER') {
      const dbRes = await query('SELECT * FROM classrooms WHERE teacher_id = $1 ORDER BY created_at DESC', [user.id]);
      return res.json(dbRes.rows);
    } else if (user.role === 'STUDENT') {
      const dbRes = await query(`
        SELECT c.* FROM classrooms c
        JOIN enrollments e ON c.id = e.classroom_id
        WHERE e.student_id = $1
        ORDER BY c.created_at DESC
      `, [user.id]);
      return res.json(dbRes.rows);
    } else {
      return res.status(403).json({ error: 'Role not supported' });
    }
  } catch (error) {
    console.error('Fetch classrooms error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (user.role !== 'TEACHER') {
    return res.status(403).json({ error: 'Only teachers can create classrooms' });
  }

  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Classroom name is required' });
  }

  try {
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const dbRes = await query(
      'INSERT INTO classrooms (name, description, teacher_id, join_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, user.id, joinCode]
    );

    return res.status(201).json(dbRes.rows[0]);
  } catch (error) {
    console.error('Create classroom error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
