// backend/server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;
const JWT_SECRET = "BURAYI_DAHA_SONRA_ENV_YAPACAĞIZ";

app.use(cors());
app.use(express.json());

// ----- Basit dosya tabanlı "veritabanı" -----

const DATA_FILE = path.join(__dirname, "data.json");

function loadDb() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      users: [],
      expenses: [],
      budgets: [],
      nextIds: { users: 1, expenses: 1, budgets: 1 },
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("DB parse error, resetleniyor:", e);
    const reset = {
      users: [],
      expenses: [],
      budgets: [],
      nextIds: { users: 1, expenses: 1, budgets: 1 },
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(reset, null, 2), "utf8");
    return reset;
  }
}

function saveDb(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

let db = loadDb();

// ----- Yardımcı fonksiyonlar -----

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Token gerekli" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token geçersiz veya süresi dolmuş" });
  }
}

function getMonthKeyFromDate(dateMs) {
  const d = new Date(dateMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// ----- AUTH ENDPOINTLERİ -----

// Kayıt ol
app.post("/api/auth/signup", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Kullanıcı adı ve şifre zorunlu" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "Şifre en az 4 karakter olmalı" });
  }

  const existing = db.users.find((u) => u.username === username);
  if (existing) {
    return res.status(409).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
  }

  const now = Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);

  const userId = db.nextIds.users++;
  const user = {
    id: userId,
    username,
    password_hash: passwordHash,
    created_at: now,
  };
  db.users.push(user);
  saveDb(db);

  const token = createToken(userId);
  return res.json({
    token,
    user: { id: userId, username },
  });
});

// Giriş yap
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Kullanıcı adı ve şifre zorunlu" });
  }

  const user = db.users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
  }

  const token = createToken(user.id);
  return res.json({
    token,
    user: { id: user.id, username: user.username },
  });
});

// ----- HARCAMA ENDPOINTLERİ -----

// Harcama listesi
app.get("/api/expenses", authMiddleware, (req, res) => {
  const userId = req.userId;
  const monthKey = req.query.month_key || getMonthKeyFromDate(Date.now());

  const items = db.expenses
    .filter((e) => e.user_id === userId)
    .filter((e) => getMonthKeyFromDate(e.ts) === monthKey)
    .sort((a, b) => b.ts - a.ts);

  return res.json({ month_key: monthKey, items });
});

// Harcama ekle
app.post("/api/expenses", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { amount, description, category } = req.body || {};


  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: "Geçerli bir tutar gerekli" });
  }

  const desc = (description || "").toString().trim();
  const ts = Date.now();

  const id = db.nextIds.expenses++;
  const item = { id, user_id: userId, amount: parsedAmount, description: desc, ts };
  db.expenses.push(item);
  saveDb(db);

  return res.status(201).json(item);
});

// Tek bir harcamayı sil
app.delete("/api/expenses/:id", authMiddleware, (req, res) => {
  const userId = req.userId;
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Geçersiz id" });
  }

  const beforeLen = db.expenses.length;
  db.expenses = db.expenses.filter((e) => !(e.id === id && e.user_id === userId));
  if (db.expenses.length === beforeLen) {
    return res.status(404).json({ error: "Kayıt bulunamadı" });
  }
  saveDb(db);
  return res.json({ success: true });
});

// Bu ayki tüm harcamaları sil (sadece "şu anki ay")
app.delete("/api/expenses/month/current", authMiddleware, (req, res) => {
  const userId = req.userId;
  const monthKey = getMonthKeyFromDate(Date.now());

  const beforeLen = db.expenses.length;

  db.expenses = db.expenses.filter((e) => {
    const belongsToUser = e.user_id === userId;
    const sameMonth = getMonthKeyFromDate(e.ts) === monthKey;
    if (belongsToUser && sameMonth) return false;
    return true;
  });

  const deletedCount = beforeLen - db.expenses.length;
  saveDb(db);

  return res.json({
    success: true,
    deleted: deletedCount,
    month_key: monthKey,
  });
});

// ----- BÜTÇE ENDPOINTLERİ -----

app.get("/api/budget", authMiddleware, (req, res) => {
  const userId = req.userId;
  const monthKey = req.query.month_key || getMonthKeyFromDate(Date.now());

  const row = db.budgets.find(
    (b) => b.user_id === userId && b.month_key === monthKey
  );
  if (!row) {
    return res.json({ month_key: monthKey, amount: null });
  }
  return res.json({ month_key: monthKey, amount: row.amount });
});

app.post("/api/budget", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { amount, month_key } = req.body || {};
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: "Geçerli bir bütçe gerekli" });
  }
  const monthKey = month_key || getMonthKeyFromDate(Date.now());

  let row = db.budgets.find(
    (b) => b.user_id === userId && b.month_key === monthKey
  );
  if (!row) {
    const id = db.nextIds.budgets++;
    row = { id, user_id: userId, month_key: monthKey, amount: parsedAmount };
    db.budgets.push(row);
  } else {
    row.amount = parsedAmount;
  }
  saveDb(db);

  return res.json({ month_key: monthKey, amount: parsedAmount });
});

// ----- Sunucuyu çalıştır -----
app.listen(PORT, () => {
  console.log(`API server http://localhost:${PORT} üzerinde çalışıyor`);
});
