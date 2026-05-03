# TaskTeam — Team Task Manager

A full-stack team task management app with authentication, projects, tasks, and role-based access control.

## ✨ Features

- **Authentication** — Email/password signup & login with JWT
- **Projects & Teams** — Create projects, invite members by email
- **Tasks** — Create, assign, prioritize, set due dates, track status (To do / In progress / Done)
- **Dashboard** — Stats: total, in progress, overdue, projects + recent tasks feed
- **My Tasks** — Personal view of everything assigned to you
- **Role-based access** — Admin (global) and Member roles, plus per-project Owner permissions
  - **Owner / Admin**: full CRUD on project, members, tasks
  - **Member**: view project, update status of own assigned tasks

## 🛠 Stack

- **Frontend**: React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui
- **Backend**: Node.js · Express.js · REST API
- **Database**: MySQL
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod (client) + express-validator (server) + MySQL constraints

## 📐 Data Model

| Table | Purpose |
|---|---|
| `users` | User accounts with hashed passwords and role |
| `projects` | Projects owned by a user |
| `project_members` | Team membership per project |
| `tasks` | Tasks within a project (status, priority, assignee, due date) |

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/projects` | List all projects for user |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project by ID |
| DELETE | `/api/projects/:id` | Delete project (owner/admin) |
| GET | `/api/tasks` | All tasks |
| GET | `/api/tasks/my` | Tasks assigned to me |
| GET | `/api/tasks/project/:id` | Tasks for a project |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task status/fields |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/members/project/:id` | Get project members |
| POST | `/api/members` | Add member by email |
| DELETE | `/api/members/:id` | Remove member |
| GET | `/api/users` | List all users |

## 🚀 Run locally

### Prerequisites
- Node.js 18+
- MySQL 8+

### Backend
```bash
cd backend
npm install
# Edit .env with your MySQL credentials
node src/db-init.js   # creates database and tables
npm run dev           # runs on http://localhost:4000
```

### Frontend
```bash
npm install
npm run dev           # runs on http://localhost:8080
```

### Environment Variables

**backend/.env**