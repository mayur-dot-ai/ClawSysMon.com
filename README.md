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
| **Dual Search** | Vector search + native file search across all workspace files |
| **Skill Browser** | Read-only view of installed skills with documentation |
| **Agent Browser** | Read-only view of configured OpenClaw agents and their settings |
| **Model Testing Lab** | Test providers/models in isolation before applying to OpenClaw (v1.0 later) |

### Pro (Commercial)

GTD-based project management and AI-assisted task organization.

| Feature | Description |
|---------|-------------|
| **Unified Inbox** | Top-of-funnel capture zone for tasks and ideas |
| **AI Auto-Triage** | Automatic task categorization into projects |
| **Project Kanban** | Drag-and-drop tasks per project — prioritize within columns and move across columns (Backlog → Blocker → To Do → Doing → Done) |
| **Project Chat** | Natural language task management on boards |
| **Advanced Search** | Cross-project search with AI-powered recommendations |
| **Skill Builder** | Full CRUD (Create, Read, Update, Delete) for creating and editing skills |
| **Agent Builder** | Full CRUD (Create, Read, Update, Delete) for managing OpenClaw agents |

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

### Skill Browser
Read-only view of all installed OpenClaw skills:
- Browse system skills and custom workspace skills
- View skill documentation (SKILL.md files)
- See available tools and parameters per skill
- Understand what each skill can do before using it

### Agent Browser
Read-only view of configured OpenClaw agents:
- See all agents defined in your OpenClaw config
- View agent settings (model, workspace, memory settings)
- Check agent permissions and allowed operations
- Monitor agent session status and activity

Perfect for understanding your OpenClaw setup without risking accidental changes.

### Model Testing Lab (v1.0 Later)
ChatGPT-style interface isolated from main OpenClaw config for testing providers/models before applying them.

**Key Capabilities:**
- Test any provider/model (OpenAI, Anthropic, Ollama, etc.)
- Tool calling verification — ensure models support function calling
- Temperature/top-p tuning with immediate feedback
- Generates proper `/command` for user to submit to OpenClaw
- Handles provider failures gracefully

**API Key Storage — E2EE Approach:**
Since the Model Testing Lab needs API keys that shouldn't touch the main OpenClaw config, we use browser-side encryption:

- **Encryption:** API keys encrypted via Web Crypto API (AES-GCM) in the browser
- **Storage:** Ciphertext stored in IndexedDB (not localStorage — better for binary data)
- **Password:** User provides an encryption password that is **never stored anywhere**
- **Session-only:** Decrypted keys live only in memory; user must re-enter password after refresh
- **Paranoid mode:** Optional "don't store anything" — paste key each time (most secure)

**Security Properties:**
- ✅ Keys never leave browser unencrypted
- ✅ Server (ClawSysMon backend) never sees keys
- ✅ XSS attacker gets only ciphertext without the password
- ✅ User controls the encryption secret
- ✅ `non-extractable` CryptoKey objects for extra hardening

*Tradeoff:* User must remember their encryption password. If forgotten, keys are lost (a feature, not a bug).

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

### How Socket.io Works Here

Socket.io is the **communication pipe**, not the brain. The Node.js backend is the brain that runs continuously.

**Flow:**
```
File changes on disk
    ↓
Chokidar (Node.js) detects it
    ↓
Write to SQLite (history)
    ↓
Socket.io broadcasts: "File changed!"
    ↓
Browser updates UI (if someone's looking)
```

If nobody's connected? **Everything still works.** Events get logged to SQLite. Next time someone opens the dashboard, they see the full history.

Socket.io is just for the "live" feeling when someone's actually using it. The real work (file monitoring, config validation, process management) happens in Node.js 24/7 regardless.

### Installation

**Interactive Setup** (Recommended)

SSH into your OpenClaw server and run the installer. It will guide you through configuration interactively — no command-line flags needed.

```bash
# 1. Download the installer
curl -fsSL -o install.sh https://raw.githubusercontent.com/mayur-dot-ai/ClawSysMon.com/main/install.sh

# 2. Make it executable
chmod +x install.sh

# 3. Run interactively — answer the prompts
./install.sh
```

**The installer will ask:**
- Where to install? (default: `~/.clawsysmon/`)
- Which features to enable? (process monitor, file watcher, etc.)
- **Standalone port or reverse proxy?**
  - Standalone: Pick a port (default: 3000)
  - Reverse proxy: Configure Caddy/Nginx to route `/clawsysmon.com` → ClawSysMon, `/` → OpenClaw
- Path to your OpenClaw config? (auto-detected or manual)

Everything is configurable. No surprises.

### Network Configuration

**Option 1: Standalone Port** (Default)
- Runs on separate port (`:3000` by default)
- User-configurable

**Option 2: Reverse Proxy — Sub-Path Routing** (Recommended for single-port access)

Caddy example:
```caddy
:18789 {
    # OpenClaw Gateway at root
    reverse_proxy localhost:18788
    
    # ClawSysMon at /clawsysmon.com (case insensitive)
    reverse_proxy /clawsysmon.com* localhost:3000 {
        uri strip_prefix /clawsysmon.com
    }
}
```

Access:
- `localhost:18789/` → OpenClaw dashboard
- `localhost:18789/clawsysmon.com` → ClawSysMon

### Data Persistence

**Everything in SQLite** — minimal files on disk.

**Database naming:** Randomized for security (e.g., `clawsysmon_a7x9k2p9.db`). The actual filename is stored in `.env` which the app reads at startup.

**On disk:**
```
~/.clawsysmon/                  # Install directory
├── .env                        # DB filename, port, feature flags
├── clawsysmon_a7x9k2p9.db      # Randomized DB name — everything lives here
├── index.html                  # SPA entry
├── assets/                     # Built JS/CSS
└── logs/                       # Optional file logging
```

**In the database:**
- `settings` — User preferences, dashboard config
- `events` — Event stream history
- `projects` — Project definitions
- `tasks` — Kanban tasks with column/status
- `agents` — Custom agent definitions (Pro)

**Benefits:**
- Single-file backup (just `.db`)
- Zero-config (no MySQL to manage)
- Portable (copy DB, move to new server)
- Atomic transactions (no config corruption)

### Multi-Instance Support

You can run multiple ClawSysMon instances if needed:
- Different install directories (`~/.clawsysmon-work/`, `~/.clawsysmon-personal/`)
- Different ports (3000, 3001, etc.)
- Different SQLite databases

**Important:** Each instance should target a **specific OpenClaw instance** (by config path or PID) to avoid watcher conflicts. The installer prompts for this during setup.

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
- Database stored outside install folder
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

### v1.0 - Core Release (Priority Order)
1. [ ] Process monitor with restart capability
2. [ ] Real-time event stream
3. [ ] File watcher with attribution
4. [ ] Config editor with JSON validation
5. [ ] Dual-layer search
6. [ ] Skill browser (read-only)
7. [ ] Agent browser (read-only)
8. [ ] Model testing lab (E2EE API key storage)

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

### v2.0 - Security & Enterprise
- [ ] Full E2EE database encryption (SQLite with SQLCipher) — user configures encryption key and unlocks database each browser session

---

## Pro Version

The Pro version adds GTD-based project management:

- **Unified Inbox** for task capture
- **AI Auto-Triage** into projects
- **Kanban boards** — drag tasks within columns (prioritize) and across columns (change status)
- **Natural language** task commands
- **Full skill CRUD** with templates
- **Full agent CRUD** with persona templates
- **Multi-agent workflows** — chain agents together for complex tasks

Contact: [x.com/mayuronx](https://x.com/mayuronx) (DM for Pro inquiries)

---

## License

MIT - See [LICENSE](LICENSE)

---

*Built for OpenClaw. Monitors OpenClaw. Extends OpenClaw.*