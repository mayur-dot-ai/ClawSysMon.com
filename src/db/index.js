/**
 * Database Module
 * 
 * Uses better-sqlite3 for synchronous, fast SQLite operations.
 * All data stored in single file defined by DB_FILENAME env var.
 * 
 * Tables:
 * - settings: User preferences, config
 * - events: Event stream history
 * - projects: Project definitions (Pro)
 * - tasks: Kanban tasks (Pro)
 * - agents: Custom agent definitions (Pro)
 * - schema_version: Migration tracking
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(
  process.env.INSTALL_DIR || require('os').homedir() + '/.clawsysmon',
  process.env.DB_FILENAME || 'clawsysmon.db'
);

let db;

function initDatabase() {
  // TODO: Open database connection
  // TODO: Run migrations if needed
  // TODO: Return db instance
}

function getDb() {
  if (!db) {
    db = initDatabase();
  }
  return db;
}

module.exports = { initDatabase, getDb };