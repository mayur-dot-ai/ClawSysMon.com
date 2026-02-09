/**
 * Process Monitor Service
 * 
 * Monitors OpenClaw process:
 * - Checks PID exists
 * - Scrapes stdout for activity indicators
 * - Provides Online/Offline status
 * - Auto-restart capability (future)
 * 
 * Polls every 5-10 seconds.
 */

class ProcessMonitor {
  constructor(io, db) {
    this.io = io;
    this.db = db;
    this.interval = null;
    this.lastStatus = 'unknown';
  }

  start(openclawPid) {
    // TODO: Set up polling interval (5-10 seconds)
    // TODO: Check if PID exists
    // TODO: Try Gateway health endpoint
    // TODO: Emit status changes via Socket.IO
    // TODO: Log status changes to events table
  }

  getStatus() {
    // TODO: Return { status: 'online'|'offline', lastSeen, pid }
  }

  restart() {
    // TODO: Implement restart capability (v1.1)
  }

  stop() {
    // TODO: Clear polling interval
  }
}

module.exports = ProcessMonitor;