const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/members/project/:projectId
router.get('/project/:projectId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT pm.id, pm.user_id, pm.joined_at,
             u.email, u.full_name, u.avatar_url
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ?
    `, [req.params.projectId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/members — add member by email
router.post('/', async (req, res) => {
  const { project_id, email } = req.body;
  if (!project_id || !email) return res.status(400).json({ error: 'project_id and email required' });

  try {
    // Find user by email
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) return res.status(404).json({ error: 'No user found with that email. They must sign up first.' });

    const userId = users[0].id;

    // Check not already owner
    const [proj] = await pool.query('SELECT owner_id FROM projects WHERE id = ?', [project_id]);
    if (proj.length === 0) return res.status(404).json({ error: 'Project not found' });
    if (proj[0].owner_id === userId) return res.status(400).json({ error: 'Owner is already a member' });

    // Insert member
    await pool.query(
      'INSERT IGNORE INTO project_members (id, project_id, user_id) VALUES (UUID(), ?, ?)',
      [project_id, userId]
    );

    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM project_members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;