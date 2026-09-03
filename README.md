# Automatic Background Task Scheduler (ABTS)

A full-stack background task scheduler that demonstrates Operating System scheduling concepts (Priority Scheduling, Round Robin, cron-style time scheduling, smart resource-aware scheduling) wrapped in a modern SaaS-style dashboard.

> Stack: **Node.js + Express** (backend) · **React + Vite + Tailwind + Framer Motion + Recharts** (frontend) · **lowdb (JSON file)** as the embedded database (zero install — runs anywhere).

---

## ✨ Features

### Core
- **Task CRUD** — name, command, priority (Low/Med/High), schedule (cron *or* interval ms), retries, dependencies.
- **Scheduling Engine**
  - Priority Scheduling (High → Med → Low)
  - Round-Robin queue for fairness within the same priority
  - Cron-style time triggers (`node-cron`)
  - Interval triggers
  - **Smart scheduling**: throttles Low priority when CPU > 75%, runs backlog when system is idle.
- **Execution Engine** — `child_process.exec`, captures stdout/stderr, tracks duration, retries failed tasks up to N times.
- **Resource Monitoring** — live CPU & memory via `os` + `systeminformation`, broadcast over polling.
- **Logs & History** — per-task run history with status (Success/Failed/Running), duration, output, timestamp.

### UI / UX
- Dark / Light mode toggle (persisted to localStorage), smooth transitions.
- Dashboard cards: Total / Running / Failed / CPU / Memory.
- Live CPU & Memory area chart (Recharts).
- Task table with filters (priority, status), Run Now / Pause / Delete actions.
- Add-Task modal with validation & dropdowns.
- Toast notifications (sonner) for success/failure/errors.
- Search, auto-refresh, **CSV log export**.
- Framer Motion animations throughout.

---

## 📁 Folder structure

```
abts/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + REST API
│   │   ├── scheduler.js       # Priority + RR + cron engine
│   │   ├── executor.js        # child_process runner + retries
│   │   ├── monitor.js         # CPU/memory sampler
│   │   ├── db.js              # lowdb JSON store
│   │   └── routes.js
│   ├── data/db.json           # auto-created
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api.js
    │   ├── components/
    │   │   ├── StatCard.jsx
    │   │   ├── ResourceChart.jsx
    │   │   ├── TaskTable.jsx
    │   │   ├── AddTaskModal.jsx
    │   │   └── ThemeToggle.jsx
    │   └── hooks/usePolling.js
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup & run locally

You need **Node.js ≥ 18**.

```bash
# 1. Backend
cd backend
npm install
npm start              # runs on http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev            # opens http://localhost:5173
```

The frontend proxies `/api/*` to the backend automatically.

### Sample data
On first launch the backend seeds 3 sample tasks:
- `Echo Hello` — interval 10s, Low priority
- `Disk Usage` — cron `*/30 * * * * *` (every 30s), Medium
- `Date Stamp` — interval 5s, High

---

## 🧠 OS scheduling concepts demonstrated

| OS Concept | Where it lives |
|---|---|
| **Priority Scheduling** | `scheduler.js` — ready queue sorted High → Med → Low before dispatch. |
| **Round Robin** | Same priority tasks dequeued FIFO so no task starves its peers. |
| **Time-sharing / cron** | `node-cron` triggers, mirroring Unix `crond`. |
| **Preemption-by-resource** | If CPU > 75%, Low priority tasks are deferred (analog of *nice* + load average). |
| **Idle execution** | When CPU < 25% backlog drains — like batch schedulers running during idle slices. |
| **fork/exec** | `child_process.exec` is Node’s wrapper around POSIX `fork()` + `execve()`. |
| **Process state** | Task status `Pending → Running → Success/Failed` mirrors `READY → RUNNING → TERMINATED`. |
| **Retries** | Mirrors OS job restart on non-zero exit. |

### Comparison with real schedulers
- **cron** only triggers by time. ABTS adds priority + resource awareness.
- **Linux CFS** schedules CPU slices for processes; ABTS schedules *jobs* but uses the same idea: weight by priority + fairness within a class.
- **Kubernetes CronJob / systemd timers** are the closest production analog — ABTS is a tiny educational sibling.

---

## 🔌 REST API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/tasks` | list tasks |
| POST | `/api/tasks` | create |
| PUT | `/api/tasks/:id` | update |
| DELETE | `/api/tasks/:id` | delete |
| POST | `/api/tasks/:id/run` | run now |
| POST | `/api/tasks/:id/toggle` | pause/resume |
| GET | `/api/logs` | run history |
| GET | `/api/logs/export` | CSV download |
| GET | `/api/stats` | live CPU/mem + counters |

---

## 📝 Notes
- DB is a JSON file (`backend/data/db.json`) — swap `db.js` for Mongo/Postgres if desired.
- All commands run in your shell — only add commands you trust.
