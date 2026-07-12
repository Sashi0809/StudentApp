"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        return {
            folder: 'timetables',
            format: 'pdf',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    },
});
const upload = (0, multer_1.default)({ storage });
router.get('/', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user || !user.department_id)
        return res.status(400).json({ error: 'No department assigned' });
    try {
        const dbRes = await (0, db_1.query)('SELECT * FROM timetables WHERE department_id = $1 ORDER BY uploaded_at DESC LIMIT 1', [user.department_id]);
        return res.json(dbRes.rows[0] || null);
    }
    catch (error) {
        console.error('Fetch timetable error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/upload', auth_1.authenticate, upload.single('timetable'), async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'HOD')
        return res.status(403).json({ error: 'Only HOD can upload timetables' });
    if (!user.department_id)
        return res.status(400).json({ error: 'HOD is not assigned to a department' });
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    try {
        const dbRes = await (0, db_1.query)('INSERT INTO timetables (department_id, file_path) VALUES ($1, $2) RETURNING *', [user.department_id, filePath]);
        return res.status(201).json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Upload timetable error:', error.message, error.stack);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=timetables.js.map