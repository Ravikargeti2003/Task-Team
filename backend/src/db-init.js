// const pool = require('./db');

// async function initDb() {
//   const conn = await pool.getConnection();
//   try {
//     await conn.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         full_name VARCHAR(100),
//         avatar_url VARCHAR(500),
//         role ENUM('admin','member') DEFAULT 'member',
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       );
//     `);

//     await conn.query(`
//       CREATE TABLE IF NOT EXISTS projects (
//         id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
//         name VARCHAR(100) NOT NULL,
//         description TEXT,
//         owner_id VARCHAR(36) NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
//       );
//     `);

//     await conn.query(`
//       CREATE TABLE IF NOT EXISTS project_members (
//         id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
//         project_id VARCHAR(36) NOT NULL,
//         user_id VARCHAR(36) NOT NULL,
//         joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         UNIQUE KEY unique_member (project_id, user_id),
//         FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//       );
//     `);

//     await conn.query(`
//       CREATE TABLE IF NOT EXISTS tasks (
//         id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
//         project_id VARCHAR(36) NOT NULL,
//         title VARCHAR(200) NOT NULL,
//         description TEXT,
//         status ENUM('todo','in_progress','done') DEFAULT 'todo',
//         priority ENUM('low','medium','high') DEFAULT 'medium',
//         assignee_id VARCHAR(36),
//         created_by VARCHAR(36) NOT NULL,
//         due_date DATE,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//         FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
//         FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
//         FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
//       );
//     `);

//     console.log('✅ Database tables created successfully');
//   } finally {
//     conn.release();
//   }
//   process.exit(0);
// }

// initDb().catch(err => { console.error(err); process.exit(1); });




require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDb() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await conn.query(`USE \`${process.env.DB_NAME}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      avatar_url VARCHAR(500),
      role ENUM('admin','member') DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      owner_id VARCHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS project_members (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      project_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_member (project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      project_id VARCHAR(36) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('todo','in_progress','done') DEFAULT 'todo',
      priority ENUM('low','medium','high') DEFAULT 'medium',
      assignee_id VARCHAR(36),
      created_by VARCHAR(36) NOT NULL,
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Database and tables created successfully');
  await conn.end();
  process.exit(0);
}

initDb().catch(err => { console.error(err); process.exit(1); });