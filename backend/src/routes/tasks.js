const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/tasks — all tasks for the current user (assignee or created_by)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, p.name AS project_name FROM tasks t
      JOIN projects p ON p.id = t.project_id
      ORDER BY t.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tasks/my — tasks assigned to me
router.get('/my', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, p.name AS project_name FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE t.assignee_id = ?
      ORDER BY t.due_date ASC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tasks/project/:projectId
router.get('/project/:projectId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
      [req.params.projectId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks
router.post('/',
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('project_id').notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { title, description, project_id, priority = 'medium', assignee_id, due_date } = req.body;
    try {
      await pool.query(
        `INSERT INTO tasks (id, project_id, title, description, priority, assignee_id, due_date, created_by)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
        [project_id, title, description || null, priority, assignee_id || null, due_date || null, req.user.id]
      );
      const [rows] = await pool.query('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC LIMIT 1', [project_id]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// PATCH /api/tasks/:id
router.patch('/:id',
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  async (req, res) => {
    try {
      const { status, priority, title, description, assignee_id, due_date } = req.body;
      const updates = [];
      const values = [];

      if (status !== undefined) { updates.push('status = ?'); values.push(status); }
      if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
      if (title !== undefined) { updates.push('title = ?'); values.push(title); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (assignee_id !== undefined) { updates.push('assignee_id = ?'); values.push(assignee_id); }
      if (due_date !== undefined) { updates.push('due_date = ?'); values.push(due_date); }

      if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });

      values.push(req.params.id);
      await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);

      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;