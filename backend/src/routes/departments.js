import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const dbRes = await query('SELECT * FROM departments ORDER BY name ASC');
    return res.json(dbRes.rows);
  } catch (error) {
    console.error('Fetch departments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;