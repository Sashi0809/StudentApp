"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const dbRes = await (0, db_1.query)('SELECT * FROM departments ORDER BY name ASC');
        return res.json(dbRes.rows);
    }
    catch (error) {
        console.error('Fetch departments error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=departments.js.map