/**
 * Config API Routes
 * 
 * GET /api/config - Get OpenClaw config.json
 * POST /api/config - Update config.json (with validation)
 * GET /api/config/soul - Get soul.md
 * POST /api/config/soul - Update soul.md
 * POST /api/config/validate - Validate config without saving
 */

const express = require('express');
const router = express.Router();

// TODO: Implement config read/write with JSON schema validation
// TODO: Implement smart reboot detection (config.json needs restart, soul.md doesn't)
// TODO: Implement backup before save
// TODO: Implement rollback on failed validation

module.exports = router;