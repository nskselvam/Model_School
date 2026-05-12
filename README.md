# Common Structure — Full Stack Web Application

A role-based web application with a Node.js/Express backend and a React/Vite frontend.

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Node.js, Express, Sequelize ORM, PostgreSQL     |
| Auth      | JWT (HTTP-only cookies), bcrypt, express-session|
| Cache     | Redis                                           |
| Frontend  | React 18, Vite, Redux Toolkit, React Router v6  |
| UI        | Bootstrap 5, React-Toastify                     |
| Process   | PM2 (production)                                |

## Project Structure

```
Common_Structure/
├── backend/          # Express API server
│   ├── config/       # DB, Redis config
│   ├── controller/   # Route handlers
│   ├── db/           # Sequelize models & migrations
│   ├── middleware/   # Auth, error handling
│   ├── router/       # Express routers
│   └── utils/        # Helpers (JWT, mail, SMS, etc.)
├── frontend/         # React/Vite SPA
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux-slice/
│       ├── router/
│       └── store/
└── nginx/            # Nginx config (production)
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
cp .env.example .env   # fill in DB, JWT, Redis values
npm start              # nodemon app.js  (dev)
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Vite dev server on http://localhost:5173
```

### Environment Variables (backend `.env`)

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
CLIENT_URL=http://localhost:5173
```

## User Roles

| Role | Value | Default Dashboard              |
|------|-------|-------------------------------|
| State Admin | 0 | `/state/common/dashboard` |
| District Admin | 1 | `/district/common/dashboard` |
| Candidate | 2 | `/candidate/dashboard` |
| Zone Admin | 3 | `/zone/common/dashboard` |

## API Base

All API routes are prefixed with `/api`:

| Router              | Base Path               |
|---------------------|-------------------------|
| Auth                | `/api/auth`             |
| Navbar              | `/api/navbar`           |
| Dashboard           | `/api/dashboard`        |
| Admin Operations    | `/api/admin`            |
| Data Backup         | `/api/data-backup`      |
| Master Data Update  | `/api/updata_master_data`|
| General SQL         | `/api/general`          |
| Admin SQL           | `/api/admin-sql`        |
| Redis               | `/api/redis`            |

## Production (PM2)

```bash
cd backend
pm2 start ecosystem.config.js
```
