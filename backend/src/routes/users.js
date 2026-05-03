const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/users — all users (for member assignment in projects)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, full_name, avatar_url, role FROM users ORDER BY full_name ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;