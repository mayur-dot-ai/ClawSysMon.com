# ClawSysMon Core

> OpenClaw System Monitor - Process watcher and status dashboard

A minimal, standalone dashboard to monitor your OpenClaw instance. Runs independently so if OpenClaw crashes, you can still see status and restart it.

## Features

- **Process Monitor** - Watch OpenClaw PID, show Online/Offline status
- **Revive Button** - Restart OpenClaw gateway with one click
- **Auto-refresh** - Checks status every 5 seconds
- **Survives crashes** - Runs on separate port (3001), independent of OpenClaw

## Quick Start

```bash
npm install
npm start
# Open http://localhost:3001
```

## Screenshot

Simple status card showing:
- 🟢 Online / 🔴 Offline indicator (with pulse animation)
- OpenClaw PID when running
- "Revive OpenClaw" button when offline
- Last check timestamp

## API

- `GET /api/status` - Returns `{online: true/false, pid: 12345}`
- `POST /api/revive` - Restarts OpenClaw gateway

## Status

✅ **Complete and functional** - Ready to use

---

*Part of the ClawSysMon family. Built for OpenClaw.*