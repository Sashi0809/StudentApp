"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/students', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user || !['TEACHER', 'HOD'].includes(user.role))
        return res.status(403).json({ error: 'Unauthorized' });
    try {
        let dbRes;
        if (user.role === 'TEACHER') {
            dbRes = await (0, db_1.query)(`
        SELECT DISTINCT u.id, u.name, u.email 
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        JOIN classrooms c ON e.classroom_id = c.id
        WHERE u.role = 'STUDENT' AND c.teacher_id = $1
        ORDER BY u.name ASC
      `, [user.id]);
        }
        else {
            dbRes = await (0, db_1.query)("SELECT id, name, email FROM users WHERE role = 'STUDENT' ORDER BY name ASC");
        }
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch students error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/teachers', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'HOD')
        return res.status(403).json({ error: 'Only HOD can view this' });
    if (!user.department_id)
        return res.status(400).json({ error: 'HOD is not assigned to a department' });
    try {
        const dbRes = await (0, db_1.query)("SELECT id, name, email, subject FROM users WHERE role = $1 AND department_id = $2 AND approval_status = 'APPROVED' ORDER BY name ASC", ['TEACHER', user.department_id]);
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch teachers error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/teachers/pending', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'HOD')
        return res.status(403).json({ error: 'Only HOD can view this' });
    if (!user.department_id)
        return res.status(400).json({ error: 'HOD is not assigned to a department' });
    try {
        const dbRes = await (0, db_1.query)("SELECT id, name, email, subject FROM users WHERE role = $1 AND department_id = $2 AND approval_status = 'PENDING' ORDER BY name ASC", ['TEACHER', user.department_id]);
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch pending teachers error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/teachers/:id/status', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'HOD')
        return res.status(403).json({ error: 'Only HOD can update status' });
    if (!user.department_id)
        return res.status(400).json({ error: 'HOD is not assigned to a department' });
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const dbRes = await (0, db_1.query)("UPDATE users SET approval_status = $1 WHERE id = $2 AND role = 'TEACHER' AND department_id = $3 RETURNING id", [status, req.params.id, user.department_id]);
        if (dbRes.rowCount === 0)
            return res.status(404).json({ error: 'Teacher not found or not in your department' });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Update teacher status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me/assignments', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'STUDENT')
        return res.status(403).json({ error: 'Only students can view their assignments' });
    try {
        const dbRes = await (0, db_1.query)(`
      SELECT a.*, c.name as classroom_name
      FROM classroom_assignments a
      JOIN enrollments e ON a.classroom_id = e.classroom_id
      JOIN classrooms c ON a.classroom_id = c.id
      WHERE e.student_id = $1 
        AND a.deadline > CURRENT_TIMESTAMP
        AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id = $1)
      ORDER BY a.deadline ASC
    `, [user.id]);
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch student assignments error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map