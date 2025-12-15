const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'habits.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT,
      reminderTime TEXT, 
      isReminderEnabled BOOLEAN DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitId INTEGER,
      date TEXT,
      FOREIGN KEY(habitId) REFERENCES habits(id)
    );
  `);

  console.log('Database initialized');
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { initDB, getDB };
