import { Router } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Only students can join classrooms' });
  }

  const { joinCode } = req.body;
  if (!joinCode) {
    return res.status(400).json({ error: 'Join code is required' });
  }

  try {
    const classroomRes = await query('SELECT id FROM classrooms WHERE join_code = $1', [joinCode.toUpperCase()]);

    if (classroomRes.rowCount === 0) {
      return res.status(404).json({ error: 'Invalid join code' });
    }

    const classroomId = classroomRes.rows[0].id;

    const checkRes = await query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND classroom_id = $2',
      [user.id, classroomId]
    );

    if ((checkRes.rowCount ?? 0) > 0) {
      return res.status(400).json({ error: 'Already enrolled in this classroom' });
    }

    await query(
      'INSERT INTO enrollments (student_id, classroom_id) VALUES ($1, $2)',
      [user.id, classroomId]
    );

    return res.status(201).json({ success: true, classroomId });
  } catch (error) {
    console.error('Join classroom error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;