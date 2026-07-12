"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Get all semesters
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const dbRes = await (0, db_1.query)('SELECT * FROM semesters ORDER BY start_date DESC');
        res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch semesters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get active semester
router.get('/active', auth_1.authenticate, async (req, res) => {
    try {
        const dbRes = await (0, db_1.query)('SELECT * FROM semesters WHERE is_active = true LIMIT 1');
        if (dbRes.rowCount === 0)
            return res.status(404).json({ error: 'No active semester found' });
        res.json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Fetch active semester error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create new semester (HOD only)
router.post('/', auth_1.authenticate, async (req, res) => {
    const { user } = req;
    if (user.role !== 'HOD')
        return res.status(403).json({ error: 'Unauthorized' });
    const { name, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Check if there's already an active semester. If so, creating a new one as active overrides it.
        // For simplicity, new semesters are created as active by default, ending the previous one.
        const dbRes = await (0, db_1.query)(`
      INSERT INTO semesters (name, start_date, end_date, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `, [name, start_date, end_date]);
        res.status(201).json(dbRes.rows[0]);
    }
    catch (error) {
        console.error('Create semester error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// End semester and retrain ML model (HOD only)
router.post('/:id/end', auth_1.authenticate, async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    if (user.role !== 'HOD')
        return res.status(403).json({ error: 'Unauthorized' });
    try {
        // 1. Mark semester as inactive
        await (0, db_1.query)('UPDATE semesters SET is_active = false WHERE id = $1', [id]);
        // 2. Fetch all performance data for this semester
        const perfRes = await (0, db_1.query)(`
      SELECT attendance, assignment_avg, mid_marks, internal_marks, subject_difficulty, previous_cgpa, 
             CASE WHEN final_score >= 50 THEN 1 ELSE 0 END as passed
      FROM student_performance 
      WHERE semester_id = $1 AND shared_at IS NOT NULL
    `, [id]);
        // 3. Trigger ML Retraining process if there is data
        if (perfRes.rowCount > 0) {
            const pythonScript = path_1.default.join(__dirname, '../../ml/retrain_json.py');
            const pythonProcess = (0, child_process_1.spawn)('python', [pythonScript]);
            pythonProcess.stdin.write(JSON.stringify(perfRes.rows));
            pythonProcess.stdin.end();
            pythonProcess.stdout.on('data', (data) => console.log('ML Retrain Out:', data.toString()));
            pythonProcess.stderr.on('data', (data) => console.error('ML Retrain Err:', data.toString()));
        }
        res.json({ message: 'Semester ended successfully. ML retraining triggered in background.' });
    }
    catch (error) {
        console.error('End semester error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=semesters.js.map