// logdb.js
const Database = require("sqlite3").Database;
const db = new Database("log.db");

// Inisialisasi tabel logs
function initLog() {
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    date TEXT
  )`);
}

// Simpan log request per platform (default: tiktok)
function logRequest(type = "tiktok") {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  db.run("INSERT INTO logs (type, date) VALUES (?, ?)", [type, today]);
}

// Hitung jumlah request 7 hari terakhir berdasarkan type/platform
function countRequestsLast7Days(type, callback) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateThreshold = sevenDaysAgo.toISOString().split("T")[0];

  db.get(
    "SELECT COUNT(*) AS total FROM logs WHERE type = ? AND date >= ?",
    [type, dateThreshold],
    (err, row) => {
      if (err) return callback(err);
      callback(null, row.total);
    }
  );
}

module.exports = {
  initLog,
  logRequest,
  countRequestsLast7Days
};
