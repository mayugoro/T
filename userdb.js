// userdb.js - untuk menyimpan dan mengambil data user Telegram

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Buat tabel jika belum ada
const init = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT UNIQUE,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
};

// Simpan user jika belum ada
const saveUser = (chatId) => {
  db.run(
    `INSERT OR IGNORE INTO users (chat_id) VALUES (?)`,
    [chatId],
    (err) => {
      if (err) console.error("❌ Gagal simpan user:", err.message);
    }
  );
};

// Ambil semua user untuk broadcast
const getAllUsers = (callback) => {
  db.all(`SELECT chat_id FROM users`, [], (err, rows) => {
    if (err) return callback(err, null);
    callback(null, rows.map(row => row.chat_id));
  });
};

module.exports = {
  init,
  saveUser,
  getAllUsers
};
