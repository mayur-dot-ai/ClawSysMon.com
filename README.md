# ClawSysMon - An OpenClaw System Monitor

> A standalone management cockpit for OpenClaw. Monitor, configure, and extend your personal AI assistant with confidence.

**Key Principle:** The dashboard runs independently of OpenClaw. If OpenClaw crashes, the dashboard survives to help you diagnose and recover.

---

## Features Overview

### Core (Open Source)

Real-time monitoring, configuration management, and safe experimentation tools for OpenClaw.

| Feature | Description |
|---------|-------------|
| **Process Monitor** | Watch OpenClaw PID, show Online/Offline status, restart on crash |
| **Event Stream** | Live log of file changes, agent actions, config updates |
| **File Watcher** | inotify-based monitoring of `/memory`, `/workspace`, configs |
| **Config Editor** | Edit `config.json`, `soul.md`, agent memory files with validation |
| **Agent Browser** | Built-in browser automation for web tasks, testing, and data extraction |
| **Model Testing Lab** | Test providers/models in isolation before applying to OpenClaw |
| **Dual Search** | Vector search + native file search across all workspace files |
| **Skill Browser** | Read-only view of installed skills with documentation |

### Pro (Commercial)

GTD-based project management and AI-assisted task organization.

| Feature | Description |
|---------|-------------|
| **Unified Inbox** | Top-of-funnel capture zone for tasks and ideas |
| **AI Auto-Triage** | Automatic task categorization into projects |
| **Project Kanban** | Drag-and-drop boards per project |
| **Project Chat** | Natural language task management on boards |
| **Advanced Search** | Cross-project search with AI-powered recommendations |
| **Skill Builder** | Full CRUD for creating and editing skills |

---

## Core Features (This Repo)

### Process Health Monitor
- Watches OpenClaw PID via `pm2-interface` or `child_process`
- Displays connection status (🟢 Online / 🔴 Offline)
- Auto-detects crashes and provides "Revive" button
- Shows "Agent is thinking..." indicators by scraping stdout
- Survives OpenClaw crashes (runs independently)

### Real-Time Event Stream
Live log of every system event:
- File changes (CREATE, MODIFY, DELETE)
- Agent actions and decisions
- Config changes and reboot events
- Model API calls and responses

**Attribution:** Distinguishes between User edits and Agent updates via write-lock tracking.

### Linux File Watcher
- Uses inotify (via Chokidar) for high-performance monitoring
- Watches `/memory`, `/workspace`, and OpenClaw config directories
- Logs every filesystem event with timestamp
- Stores event history in local SQLite (survives crashes)

### Configuration Management

#### Smart Reboot Detection
Analyzes which files changed to determine if reboot needed:
- `config.json` changes → Reboot required (shows "Pending Changes" button)
- `soul.md` changes → Hot-reload possible
- Memory file changes → No reboot needed

#### File CRUD Operations

**Full Read/Write:**
- `soul.md` - Main instance personality
- `config.json` - Core configuration (with JSON schema validation)
- Agent memory files (per-agent `.md` files)
- `MEMORY.md` and daily memory logs

**Read-Only:**
- Skills folder - Parse and display existing skills as cards
- Show skill documentation and parameters

#### JSON Schema Validation
- Validates `config.json` before allowing "Save & Reboot"
- Prevents syntax errors from crashing OpenClaw
- "Test Config" button validates without applying
- Rollback to last known good config on failed reboot

### Agent Browser
Built-in browser automation using [agent-browser](https://github.com/vercel-labs/agent-browser) (Vercel Labs) — a fast Rust-based CLI with AI-friendly ref-based element selection.

**Key Capabilities:**
- **Ref-based Automation:** Snapshot pages to get element refs (@e1, @e2), then interact without brittle CSS selectors
- **Headless or Headed:** Run invisible or watch the browser work
- **Multi-session:** Isolate cookies/storage per task with session profiles
- **Web Testing:** Fill forms, click buttons, extract data, take screenshots
- **Mobile Testing:** iOS Simulator support for mobile web testing

**Example Workflow:**
```bash
# 1. Navigate and snapshot
agent-browser open example.com
agent-browser snapshot -i

# 2. Use refs to interact
agent-browser click @e2
agent-browser fill @e3 "search query"

# 3. Extract data
agent-browser get text @e1
agent-browser screenshot capture.png
```

Perfect for automating web tasks, testing integrations, or scraping data without leaving the dashboard.

### Model Testing Lab
- ChatGPT-style interface isolated from main OpenClaw config
- Test any provider/model (OpenAI, Anthropic, Ollama, etc.)
- Temporary API keys (not persisted to main config)
- Generates proper `/command` for user to submit to OpenClaw
- Handles provider failures gracefully

### Search & Discovery

**Layer 1: OpenClaw Native Search**
- Uses internal vector + BM25 search
- Searches conversation history and semantic memory

**Layer 2: JS Native File Search**
- Recursive `fs` search across all workspace files
- Raw string matching in `.md`, `.json`, `.log` files

**Deduplication:**
- Merges results when both layers find the same content
- Flags "ghost" entries (deleted files still in vector index)

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Real-Time | Socket.io (WebSockets) |
| File Watching | Chokidar (inotify wrapper) |
| Frontend | React + Tailwind CSS |
| Database | SQLite (local file) |
| Process Mgmt | pm2-interface or child_process |
| Browser Automation | agent-browser (Rust + Playwright) |

### Installation

One-command setup:

```bash
curl -fsSL https://raw.githubusercontent.com/mayur-dot-ai/ClawSysMon.com/main/install.sh | bash
```

The script will:
1. Clone repo to `~/.clawsysmon/`
2. Initialize SQLite database
3. Set up local auth credentials
4. Build production assets
5. Output local URL: `http://localhost:3000`

### Network Configuration

**Option 1: Standalone Port** (Default)
- Runs on separate port (`:3000` by default)
- User-configurable

**Option 2: Reverse Proxy** (For tunnel users)
- Caddy/Nginx routes `/` → Dashboard, `/api/openclaw` → OpenClaw
- Single exposed port serves both

### Data Persistence

```
~/.clawsysmon/
├── data/
│   ├── clawsysmon.db          # Main SQLite database
│   ├── clawsysmon.db.backup   # Auto-backup
│   └── event-stream.log       # Raw event log (JSONL)
├── config/
│   ├── auth.json              # Local auth
│   └── dashboard.json         # UI preferences
└── logs/
    └── dashboard.log
```

---

## Safety Features

### Crash Recovery
If OpenClaw crashes due to a config error:
- Dashboard remains active with full event history
- Highlights the last file change before crash
- Offers "Rollback & Restart" button
- JSON editor available even when OpenClaw is down

### Attribution Logic
File watcher detects changes but doesn't know who made them:
- Dashboard marks when it's writing ("System Lock")
- Changes during lock = User edit
- Changes outside lock = Agent/System edit
- Debounce for rapid successive changes

### Config Conflict Resolution
If user edits while agent writes:
- File-level locking with 5-second timeout
- Visual indicator when file is "locked by system"
- Merge strategy for non-conflicting changes

### Data Recovery
- Database stored in `~/.clawsysmon/` (outside install folder)
- Auto-backup before schema migrations
- Daily backups to `~/.clawsysmon/backups/`

---

## Development Setup

```bash
# Clone and setup
git clone https://github.com/mayur-dot-ai/ClawSysMon.com.git
cd ClawSysMon.com
npm install

# Development mode
npm run dev

# Build for production
npm run build
npm start
```

---

## Roadmap

### v1.0 - Core Release
- [ ] Process monitor with restart capability
- [ ] Real-time event stream
- [ ] File watcher with attribution
- [ ] Config editor with JSON validation
- [ ] Agent Browser integration
- [ ] Model testing lab
- [ ] Dual-layer search
- [ ] Skill browser (read-only)

### v1.1 - Enhanced Monitoring
- [ ] Event stream filters and search
- [ ] Health heartbeat alerts
- [ ] Performance metrics (CPU, memory)
- [ ] Log aggregation and export

### v1.2 - Advanced Config
- [ ] Config diff viewer
- [ ] Versioned config history
- [ ] One-click rollback
- [ ] Schema documentation inline

---

## Pro Version

The Pro version adds GTD-based project management:

- **Unified Inbox** for task capture
- **AI Auto-Triage** into projects
- **Kanban boards** per project
- **Natural language** task commands
- **Full skill CRUD** with templates

Contact: [pro@clawsysmon.com](mailto:pro@clawsysmon.com)

---

## License

MIT - See [LICENSE](LICENSE)

---

*Built for OpenClaw. Monitors OpenClaw. Extends OpenClaw.*