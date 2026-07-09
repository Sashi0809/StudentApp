"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
const verifyClassroomAccess = async (userId, role, classroomId) => {
    if (role === 'TEACHER') {
        const res = await (0, db_1.query)('SELECT id FROM classrooms WHERE id = $1 AND teacher_id = $2', [classroomId, userId]);
        return (res.rowCount ?? 0) > 0;
    }
    else if (role === 'STUDENT') {
        const res = await (0, db_1.query)('SELECT classroom_id FROM enrollments WHERE classroom_id = $1 AND student_id = $2', [classroomId, userId]);
        return (res.rowCount ?? 0) > 0;
    }
    return false;
};
router.get('/', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        if (user.role === 'TEACHER') {
            const dbRes = await (0, db_1.query)('SELECT * FROM classrooms WHERE teacher_id = $1 ORDER BY created_at DESC', [user.id]);
            return res.json(dbRes.rows);
        }
        else if (user.role === 'STUDENT') {
            const dbRes = await (0, db_1.query)(`
        SELECT c.* FROM classrooms c
        JOIN enrollments e ON c.id = e.classroom_id
        WHERE e.student_id = $1
        ORDER BY c.created_at DESC
      `, [user.id]);
            return res.json(dbRes.rows);
        }
        else {
            return res.status(403).json({ error: 'Role not supported' });
        }
    }
    catch (error) {
        console.error('Fetch classrooms error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'TEACHER') {
        return res.status(403).json({ error: 'Only teachers can create classrooms' });
    }
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Classroom name is required' });
    }
    try {
        const joinCode = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
        const dbRes = await (0, db_1.query)('INSERT INTO classrooms (name, description, teacher_id, join_code) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, user.id, joinCode]);
        return res.status(201).json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Create classroom error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET specific classroom
router.get('/:id', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        const dbRes = await (0, db_1.query)('SELECT * FROM classrooms WHERE id = $1', [id]);
        if (dbRes.rowCount === 0)
            return res.status(404).json({ error: 'Classroom not found' });
        return res.json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Fetch classroom error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET materials
router.get('/:id/materials', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        const dbRes = await (0, db_1.query)('SELECT * FROM classroom_materials WHERE classroom_id = $1 ORDER BY uploaded_at DESC', [id]);
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch materials error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// POST material
router.post('/:id/materials', auth_1.authenticate, upload.single('file'), async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const { title } = req.body;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'TEACHER')
        return res.status(403).json({ error: 'Only teachers can upload materials' });
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    if (!title)
        return res.status(400).json({ error: 'Title is required' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        const filePath = `/uploads/${req.file.filename}`;
        const dbRes = await (0, db_1.query)('INSERT INTO classroom_materials (classroom_id, title, file_path) VALUES ($1, $2, $3) RETURNING *', [id, title, filePath]);
        return res.status(201).json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Upload material error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET assignments
router.get('/:id/assignments', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        const dbRes = await (0, db_1.query)('SELECT * FROM classroom_assignments WHERE classroom_id = $1 ORDER BY deadline ASC', [id]);
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch assignments error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// POST assignment
router.post('/:id/assignments', auth_1.authenticate, upload.single('file'), async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const { title, description, deadline } = req.body;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'TEACHER')
        return res.status(403).json({ error: 'Only teachers can upload assignments' });
    if (!title || !deadline)
        return res.status(400).json({ error: 'Title and deadline are required' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        const filePath = req.file ? `/uploads/${req.file.filename}` : null;
        const dbRes = await (0, db_1.query)('INSERT INTO classroom_assignments (classroom_id, title, description, deadline, file_path) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id, title, description || null, deadline, filePath]);
        return res.status(201).json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Upload assignment error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// GET submissions for an assignment
router.get('/:id/assignments/:assignmentId/submissions', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    const { id, assignmentId } = req.params;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        if (user.role === 'TEACHER') {
            const dbRes = await (0, db_1.query)(`
        SELECT s.*, u.name as student_name, u.email as student_email 
        FROM assignment_submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.assignment_id = $1
        ORDER BY s.submitted_at DESC
      `, [assignmentId]);
            return res.json(dbRes.rows);
        }
        else if (user.role === 'STUDENT') {
            const dbRes = await (0, db_1.query)('SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2', [assignmentId, user.id]);
            return res.json(dbRes.rows);
        }
    }
    catch (error) {
        console.error('Fetch submissions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// POST submission
router.post('/:id/assignments/:assignmentId/submit', auth_1.authenticate, upload.single('file'), async (req, res) => {
    const user = req.user;
    const { id, assignmentId } = req.params;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'STUDENT')
        return res.status(403).json({ error: 'Only students can submit assignments' });
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    try {
        const hasAccess = await verifyClassroomAccess(user.id, user.role, id);
        if (!hasAccess)
            return res.status(403).json({ error: 'Access denied to this classroom' });
        const filePath = `/uploads/${req.file.filename}`;
        const dbRes = await (0, db_1.query)('INSERT INTO assignment_submissions (assignment_id, student_id, file_path) VALUES ($1, $2, $3) RETURNING *', [assignmentId, user.id, filePath]);
        return res.status(201).json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Submit assignment error:', error);
        if (error.code === '23505') { // unique violation
            return res.status(400).json({ error: 'You have already submitted this assignment' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=classrooms.js.map