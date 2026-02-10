# ClawSysMon

> OpenClaw System Monitor - Core process watcher + Pro Kanban project management

## Structure

This repo contains two packages:

### `/core` - Process Monitor
Minimal OpenClaw status dashboard:
- Shows Online/Offline status with pulsing indicator
- Displays OpenClaw PID
- "Revive" button to restart OpenClaw gateway
- Auto-refreshes every 5 seconds

**To run:**
```bash
cd core
npm install
npm start
# Open http://localhost:3001
```

### `/pro` - Kanban Project Management  
Full-featured project management backend:
- Projects (create, list, get)
- Cards/Kanban items (CRUD, status: todo/in-progress/done)
- Comments on cards
- SQL runner for direct queries
- SQLite database with better-sqlite3

**To run:**
```bash
cd pro
npm install
npm start
# Open http://localhost:3002
```

**API Endpoints:**
- `GET/POST /api/projects` - List/create projects
- `GET /api/projects/:id` - Get project
- `GET /api/projects/:id/cards` - Get project cards
- `POST /api/projects/:id/cards` - Create card
- `PATCH /api/cards/:id` - Update card (status, title, body)
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/comments` - Add comment
- `POST /api/sql` - Run SQL queries

## Status

- ✅ Core: Complete (minimal but functional)
- ✅ Pro Backend: Complete (full Kanban API)
- ❌ Pro Frontend: Not built (needs React/Vue Kanban UI)

## Next Steps

1. Build Pro frontend with drag-drop Kanban board
2. Add unified inbox for task capture
3. Add AI auto-triage for categorizing tasks
4. Connect to OpenClaw for session management

---

*Built for OpenClaw. Monitors OpenClaw. Extends OpenClaw.*