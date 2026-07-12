"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, async (req, res) => {
    const { user } = req;
    if (user.role !== 'STUDENT')
        return res.status(403).json({ error: 'Unauthorized' });
    const { description } = req.body;
    if (!description)
        return res.status(400).json({ error: 'Description required' });
    try {
        const insertRes = await (0, db_1.query)(`
      INSERT INTO complaints (student_id, description)
      VALUES ($1, $2)
      RETURNING *
    `, [user.id, description]);
        res.json(insertRes.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/', auth_1.authenticate, async (req, res) => {
    const { user } = req;
    try {
        if (user.role === 'HOD') {
            const q = `
        SELECT c.*, s.name as student_name, s.email as student_email 
        FROM complaints c
        JOIN users s ON c.student_id = s.id
        ORDER BY c.created_at DESC
      `;
            const dbRes = await (0, db_1.query)(q);
            return res.json(dbRes.rows);
        }
        else if (user.role === 'STUDENT') {
            const q = `SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC`;
            const dbRes = await (0, db_1.query)(q, [user.id]);
            return res.json(dbRes.rows);
        }
        else {
            return res.status(403).json({ error: 'Unauthorized' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id/resolve', auth_1.authenticate, async (req, res) => {
    const { user } = req;
    if (user.role !== 'HOD')
        return res.status(403).json({ error: 'Unauthorized' });
    try {
        const updateRes = await (0, db_1.query)(`
      UPDATE complaints 
      SET status = 'RESOLVED', hod_id = $1 
      WHERE id = $2 RETURNING *
    `, [user.id, req.params.id]);
        res.json(updateRes.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=complaints.js.map