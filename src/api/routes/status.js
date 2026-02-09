/**
 * Status API Routes
 * 
 * GET /api/status - Overall system status
 * GET /api/status/openclaw - OpenClaw process status
 * GET /api/status/versions - Version info for ClawSysMon and OpenClaw
 * GET /api/status/disk - Disk usage for OpenClaw and ClawSysMon
 */

const express = require('express');
const router = express.Router();

// TODO: GET /api/status - Returns { openclaw: 'online'|'offline', dashboard: 'running', timestamp }

// TODO: GET /api/status/openclaw - Polls OpenClaw PID, returns { pid, uptime, status }

// TODO: GET /api/status/versions - Returns { clawsysmon: '0.1.0', openclaw: '2026.2.3', upgradeAvailable: boolean }

// TODO: GET /api/status/disk - Returns { openclawSize: '1.2GB', clawsysmonSize: '15MB' }

module.exports = router;