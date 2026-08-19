import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.approval_status === 'REJECTED') {
      return res.status(403).json({ error: 'Your account has been deactivated or rejected by the HOD.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email, department_id: user.department_id, academic_year: user.academic_year, subject: user.subject, approval_status: user.approval_status },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department_id: user.department_id, academic_year: user.academic_year, subject: user.subject, approval_status: user.approval_status } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, department_id, academic_year, subject } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const approval_status = role === 'TEACHER' ? 'PENDING' : 'APPROVED';

    const userRes = await query(
      'INSERT INTO users (name, email, password, role, department_id, academic_year, subject, approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, department_id, academic_year, subject, approval_status',
      [name, email, hashed, role || 'STUDENT', department_id || null, academic_year || null, subject || null, approval_status]
    );

    const user = userRes.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email, department_id: user.department_id, academic_year: user.academic_year, subject: user.subject, approval_status: user.approval_status },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    return res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const userRes = await query(
      'SELECT id, name, email, role, department_id, academic_year, subject, approval_status FROM users WHERE id = $1',
      [req.user.id]
    );
    if (userRes.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userRes.rows[0] });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;