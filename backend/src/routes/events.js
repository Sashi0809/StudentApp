"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        let sql = 'SELECT * FROM events WHERE user_id = $1';
        const params = [user.id];
        if (user.role === 'STUDENT' && user.department_id) {
            sql += ' OR (department_id = $2 AND (target_year = 0 OR target_year = $3))';
            params.push(user.department_id, user.academic_year || 0);
        }
        else if (user.role === 'HOD' && user.department_id) {
            sql += ' OR department_id = $2';
            params.push(user.department_id);
        }
        sql += ' ORDER BY event_date ASC';
        const dbRes = await (0, db_1.query)(sql, params);
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch events error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    const { event_date, title, description, is_official, target_year } = req.body;
    if (!event_date || !title) {
        return res.status(400).json({ error: 'Event date and title are required' });
    }
    try {
        if (is_official && user.role === 'HOD' && user.department_id) {
            const dbRes = await (0, db_1.query)('INSERT INTO events (department_id, target_year, event_date, title, description) VALUES ($1, $2, $3, $4, $5) RETURNING *', [user.department_id, target_year || 0, event_date, title, description]);
            return res.status(201).json(dbRes.rows[0]);
        }
        else {
            const dbRes = await (0, db_1.query)('INSERT INTO events (user_id, event_date, title, description) VALUES ($1, $2, $3, $4) RETURNING *', [user.id, event_date, title, description]);
            return res.status(201).json(dbRes.rows[0]);
        }
    }
    catch (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    try {
        let dbRes;
        if (user.role === 'HOD' && user.department_id) {
            dbRes = await (0, db_1.query)('DELETE FROM events WHERE id = $1 AND (user_id = $2 OR department_id = $3) RETURNING id', [id, user.id, user.department_id]);
        }
        else {
            dbRes = await (0, db_1.query)('DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id', [id, user.id]);
        }
        if (dbRes.rowCount === 0) {
            return res.status(404).json({ error: 'Event not found or not authorized' });
        }
        return res.json({ success: true, id });
    }
    catch (error) {
        console.error('Delete event error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map