const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("tiktok_bot_cache.db", (err) => {
  if (err) {
    console.error("Gagal membuka database:", err.message);
  } else {
    console.log("✅ Database berhasil dibuka");
  }
});

// Inisialisasi semua tabel
db.serialize(() => {
  // Tabel cache audio TikTok
  db.run(`
    CREATE TABLE IF NOT EXISTS audio_cache (
      key TEXT PRIMARY KEY,
      audio_url TEXT,
      chat_id INTEGER,
      video_msg_id INTEGER
    )
  `, (err) => {
    if (err) console.error("❌ Gagal membuat tabel 'audio_cache':", err.message);
    else console.log("📁 Tabel 'audio_cache' siap");
  });

  // Tabel universal URL cache
  db.run(`
    CREATE TABLE IF NOT EXISTS url_cache (
      url TEXT PRIMARY KEY,
      source TEXT,
      video_url TEXT,
      audio_url TEXT,
      caption TEXT,
      created_at INTEGER
    )
  `, (err) => {
    if (err) console.error("❌ Gagal membuat tabel 'url_cache':", err.message);
    else console.log("📁 Tabel 'url_cache' siap");
  });

  // Tabel statistik per platform
  db.run(`
    CREATE TABLE IF NOT EXISTS stats (
      platform TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) console.error("❌ Gagal membuat tabel 'stats':", err.message);
    else console.log("📊 Tabel 'stats' siap");
  });

  // Tabel log histori download
  db.run(`
    CREATE TABLE IF NOT EXISTS log_download (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT,
      url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("❌ Gagal membuat tabel 'log_download':", err.message);
    else console.log("🕓 Tabel 'log_download' siap");
  });
});

// Fungsi simpan audio TikTok
function saveAudio(key, audioUrl, chatId, videoMsgId) {
  if (!key || !audioUrl || !chatId || !videoMsgId) {
    console.error("❌ Data tidak lengkap saat simpan audio.");
    return;
  }

  db.run(
    `INSERT OR REPLACE INTO audio_cache (key, audio_url, chat_id, video_msg_id) VALUES (?, ?, ?, ?)`,
    [key, audioUrl, chatId, videoMsgId],
    (err) => {
      if (err) console.error("❌ Gagal simpan audio:", err.message);
      else console.log("✅ Audio disimpan dengan key:", key);
    }
  );
}

// Fungsi ambil audio TikTok
function getAudio(key, callback) {
  console.log("🔍 Cari audio dengan key:", key);
  db.get(`SELECT * FROM audio_cache WHERE key = ?`, [key], (err, row) => {
    if (err) {
      console.error("❌ Gagal ambil audio:", err.message);
      return callback(err);
    }
    callback(null, row || null);
  });
}

// Fungsi simpan cache universal
function saveUrlCache(url, source, videoUrl, audioUrl, caption = "") {
  const timestamp = Date.now();
  db.run(
    `INSERT OR REPLACE INTO url_cache (url, source, video_url, audio_url, caption, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [url, source, videoUrl, audioUrl, caption, timestamp],
    (err) => {
      if (err) console.error("❌ Gagal simpan URL cache:", err.message);
      else console.log(`✅ URL cache disimpan untuk ${source}`);
    }
  );
}

// Fungsi ambil cache universal
function getUrlCache(url, callback) {
  db.get(`SELECT * FROM url_cache WHERE url = ?`, [url], (err, row) => {
    if (err) {
      console.error("❌ Gagal ambil cache URL:", err.message);
      return callback(err);
    }
    callback(null, row || null);
  });
}

// Fungsi tambah statistik per platform
function incrementStat(platform) {
  db.run(
    `INSERT INTO stats (platform, count)
     VALUES (?, 1)
     ON CONFLICT(platform) DO UPDATE SET count = count + 1`,
    [platform],
    (err) => {
      if (err) console.error("❌ Gagal update statistik:", err.message);
      else console.log(`📊 Statistik ${platform} ditambah`);
    }
  );
}

// Fungsi simpan log histori
function saveLog(platform, url) {
  db.run(
    `INSERT INTO log_download (platform, url) VALUES (?, ?)`,
    [platform, url],
    (err) => {
      if (err) console.error("❌ Gagal simpan log:", err.message);
      else console.log(`🕓 Log disimpan untuk ${platform}`);
    }
  );
}

module.exports = {
  saveAudio,
  getAudio,
  saveUrlCache,
  getUrlCache,
  incrementStat,
  saveLog
};
