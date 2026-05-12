# Common Structure — Full Stack Web Application

A role-based web application with a Node.js/Express backend and a React/Vite frontend.

## Tech Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Backend   | Node.js, Express 5, Sequelize 6 ORM, PostgreSQL                  |
| Auth      | JWT (HTTP-only cookies), bcrypt, express-session                  |
| Cache     | Redis 5 (session data: `id`, `Email_Id`, `DCODE`, `SUB_CEN`, `userRole`) |
| Frontend  | React 19, Vite, Redux Toolkit (RTK Query), React Router v7        |
| UI        | Bootstrap 5, React-Bootstrap, React-Toastify, React-Select        |
| Tables    | react-data-table-component (server-side pagination)               |
| PDF/Excel | @react-pdf/renderer, xlsx, jsPDF                                  |
| Process   | PM2 (production)                                                  |

## Project Structure

```
Common_Structure/
├── backend/
│   ├── config/         # DB (Sequelize), Redis client
│   ├── controller/     # Route handlers
│   ├── db/
│   │   ├── models/     # Sequelize models
│   │   └── migrations/
│   ├── middleware/     # Auth (JWT + Redis), error handler
│   ├── router/         # Express routers
│   └── utils/          # JWT, sendmail, sendSms, password gen, etc.
├── frontend/
│   └── src/
│       ├── components/ # Shared UI components & modals
│       ├── constants/  # App-wide constants
│       ├── hooks/      # Custom React hooks
│       ├── pages/      # Page components (by feature)
│       ├── redux-slice/# RTK Query API slices
│       ├── router/     # React Router config
│       ├── store/      # Redux store
│       └── utils/      # PDF generators, helpers
└── nginx/              # Nginx config (production reverse proxy)
```

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in values below
npm start              # nodemon (dev) — logs port on startup
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Vite dev server → http://localhost:5173
```

### Environment Variables (`backend/.env`)

```
APP_PORT=8000
NODE_ENV=development

DB_USERNAME=
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=

JWT_SECRET=
SESSION_SECRET=

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CLIENT_URL=http://localhost:5173
```

## User Roles

| Role | Value | Default Route |
|------|-------|---------------|
| State Admin | 0 | `/state/common/dashboard` |
| District Admin | 1 | `/district/common/dashboard` |
| Candidate | 2 | `/candidate/dashboard` |
| Zone Admin | 3 | `/zone/common/dashboard` |

## API Routes

All routes are prefixed with `/api` (backend default port: **8000**):

| Router              | Base Path                 |
|---------------------|---------------------------|
| Auth                | `/api/auth`               |
| Navbar              | `/api/navbar`             |
| Common              | `/api/common`             |
| Dashboard           | `/api/dashboard`          |
| Admin Operations    | `/api/admin`              |
| Data Backup         | `/api/data-backup`        |
| Master Data Update  | `/api/updata_master_data` |
| General SQL         | `/api/general`            |
| Admin SQL           | `/api/admin-sql`          |
| Redis               | `/api/redis`              |

### Pagination

All list endpoints (`/api/admin/all_user_data`, examiner endpoints) support server-side pagination:

```
GET /api/admin/all_user_data?page=1&limit=10&search=foo&ResetPass=N
```

Response shape: `{ status, data: [...], total, page, limit }`

## Production (PM2)

```bash
cd backend
pm2 start ecosystem.config.js
```
