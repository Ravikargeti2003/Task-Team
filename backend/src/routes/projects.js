const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/projects — all projects where user is owner or member
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT p.* FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id, req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects
router.post('/',
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, description } = req.body;
    try {
      await pool.query(
        'INSERT INTO projects (id, name, description, owner_id) VALUES (UUID(), ?, ?, ?)',
        [name, description || null, req.user.id]
      );
      const [rows] = await pool.query('SELECT * FROM projects WHERE owner_id = ? ORDER BY created_at DESC LIMIT 1', [req.user.id]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT owner_id FROM projects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (rows[0].owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;