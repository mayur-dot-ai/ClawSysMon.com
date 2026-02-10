const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3002;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../shared-db/clawsysmon.db');

// Initialize database
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    status TEXT DEFAULT 'todo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id)
  );
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============ PROJECTS ============

// List all projects
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
});

// Create project
app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;
  const result = db.prepare(
    'INSERT INTO projects (name, description) VALUES (?, ?)'
  ).run(name, description);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// ============ CARDS ============

// Get all cards for a project
app.get('/api/projects/:id/cards', (req, res) => {
  const cards = db.prepare(`
    SELECT c.*, COUNT(cm.id) as comment_count 
    FROM cards c 
    LEFT JOIN comments cm ON c.id = cm.card_id 
    WHERE c.project_id = ? 
    GROUP BY c.id 
    ORDER BY c.created_at DESC
  `).all(req.params.id);
  res.json(cards);
});

// Create card
app.post('/api/projects/:id/cards', (req, res) => {
  const { title, body, status = 'todo' } = req.body;
  const result = db.prepare(
    'INSERT INTO cards (project_id, title, body, status) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, title, body, status);
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(card);
});

// Update card
app.patch('/api/cards/:id', (req, res) => {
  const { title, body, status } = req.body;
  const updates = [];
  const values = [];
  
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (body !== undefined) { updates.push('body = ?'); values.push(body); }
  if (status !== undefined) { updates.push('status = ?'); values.push(status); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(req.params.id);
  
  db.prepare(`UPDATE cards SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  res.json(card);
});

// Delete card
app.delete('/api/cards/:id', (req, res) => {
  db.prepare('DELETE FROM comments WHERE card_id = ?').run(req.params.id);
  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Get single card (with comments)
app.get('/api/cards/:id', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  const comments = db.prepare('SELECT * FROM comments WHERE card_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ ...card, comments });
});

// ============ COMMENTS ============

// Add comment to card
app.post('/api/cards/:id/comments', (req, res) => {
  const { body } = req.body;
  const result = db.prepare('INSERT INTO comments (card_id, body) VALUES (?, ?)').run(req.params.id, body);
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(comment);
});

// ============ SQL RUNNER ============

// Execute SQL (read-only by default, allow writes with flag)
app.post('/api/sql', (req, res) => {
  const { query, allowWrite = false } = req.body;
  
  const isWrite = /^(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE)/i.test(query.trim());
  
  if (isWrite && !allowWrite) {
    return res.status(403).json({ error: 'Write operations require allowWrite=true' });
  }
  
  try {
    if (isWrite) {
      const result = db.prepare(query).run();
      res.json({ success: true, changes: result.changes, lastInsertRowid: result.lastInsertRowid });
    } else {
      const rows = db.prepare(query).all();
      res.json({ rows });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all tables (for SQL runner reference)
app.get('/api/sql/tables', (req, res) => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const schema = {};
  for (const { name } of tables) {
    schema[name] = db.prepare(`PRAGMA table_info(${name})`).all();
  }
  res.json(schema);
});

app.listen(PORT, () => {
  console.log(`ClawSysMon Pro running on port ${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});