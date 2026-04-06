const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, '../../database.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      price REAL NOT NULL,
      bundle_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS bundles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT NOT NULL UNIQUE,
      student_name TEXT NOT NULL,
      class TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      amount_paid REAL NOT NULL,
      change_returned REAL NOT NULL,
      delivered_status BOOLEAN DEFAULT 1,
      is_locked BOOLEAN DEFAULT 1,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );
  `);

  // Create default admin user if no users exist
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCount.count === 0) {
    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto.pbkdf2Sync('admin123', salt, 1000, 64, 'sha512').toString('hex');
    db.prepare('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)')
      .run('admin', password_hash, salt);
    console.log("Created default admin user with password 'admin123'");
  }
}

initDb();

module.exports = db;
