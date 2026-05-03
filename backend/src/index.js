require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { execSync } = require('child_process');

try {
  console.log("Running DB init...");
  execSync('node src/db-init.js', { stdio: 'inherit' });
} catch (error) {
  console.log("DB init already done or failed, continuing...");
}

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const memberRoutes = require('./routes/members');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/users', userRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));