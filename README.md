# NutriTracker (MERN)

Nutrition Monitoring System for Anganwadi Children.

## Quick start

### 1) Backend env

Create `backend/.env` from `backend/.env.example`.

### 2) Install deps

```bash
npm run install:all
```

### 3) Seed an admin user + demo center

```bash
npm run seed
```

### 4) Run dev servers

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/api`

## Roles

- ADMIN
- WORKER
- SUPERVISOR

The seed script prints login credentials in the console.

