import { Router } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'timetables',
      format: 'pdf',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const upload = multer({ storage });

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const user = req.user;
  if (!user || !user.department_id) return res.status(400).json({ error: 'No department assigned' });

  try {
    const dbRes = await query(
      'SELECT * FROM timetables WHERE department_id = $1 ORDER BY uploaded_at DESC LIMIT 1',
      [user.department_id]
    );
    return res.json(dbRes.rows[0] || null);
  } catch (error) {
    console.error('Fetch timetable error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upload', authenticate, upload.single('timetable'), async (req: AuthRequest, res) => {
  const user = req.user;
  if (!user || user.role !== 'HOD') return res.status(403).json({ error: 'Only HOD can upload timetables' });
  if (!user.department_id) return res.status(400).json({ error: 'HOD is not assigned to a department' });

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  try {
    const dbRes = await query(
      'INSERT INTO timetables (department_id, file_path) VALUES ($1, $2) RETURNING *',
      [user.department_id, filePath]
    );
    return res.status(201).json(dbRes.rows[0]);
  } catch (error: any) {
    console.error('Upload timetable error:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
