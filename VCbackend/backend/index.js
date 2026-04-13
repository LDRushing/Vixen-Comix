// server/index.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import client from "./client.js";
import db from "./db.js";
import dbDataModule from "./data.js";
import contactRoute from "./contact.js";

// Destructure the functions we need from db.js
const { 
  createTable, 
  createUser, 
  authenticate, 
  findUserByToken, 
  fetchUser, 
  saveOrUpdateProgress, 
  fetchProgressByUser 
} = db;
const { dbData } = dbDataModule;

const app = express();

// ---------------- Middleware ----------------
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ---------------- Auth Middleware ----------------
const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Not authorized");

    // Handle both 'Bearer <token>' and raw token formats
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const user = await findUserByToken(token);
    req.user = user;
    next();
  } catch (err) {
    err.status = 401;
    next(err);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin) return next();
  const err = new Error("Not authorized (Admin only)");
  err.status = 401;
  next(err);
};

// ---------------- Routes ----------------

// Contact route
app.use("/api/contact", contactRoute);

// Register
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await client.query("SELECT * FROM useradmin WHERE email = $1", [email]);
    if (existingUser.rowCount > 0) return res.status(409).json({ error: "Email already registered" });

    const newUser = await createUser({ first_name, last_name, email, password });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

// Login
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const authResult = await authenticate({ email, password });
    
    const token = jwt.sign(
      { id: authResult.id, is_admin: authResult.is_admin },
      process.env.JWT_SECRET || "vixencomix",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, user: authResult });
  } catch (err) {
    next(err);
  }
});

// User Info
app.get("/api/auth/me", isLoggedIn, (req, res) => {
  res.json({ user: req.user });
});

// ---------------- Progress Routes ----------------

// 1. SAVE or UPDATE progress
app.post('/api/progress', isLoggedIn, async (req, res, next) => {
  try {
    const { comic_slug, last_chapter_index } = req.body;
    const progress = await saveOrUpdateProgress({
      user_id: req.user.id,
      comic_slug,
      last_chapter_index
    });
    res.status(201).send(progress);
  } catch (ex) {
    next(ex);
  }
});

// 2. GET progress for the logged-in user
app.get('/api/progress', isLoggedIn, async (req, res, next) => {
  try {
    const progress = await fetchProgressByUser(req.user.id);
    res.send(progress);
  } catch (ex) {
    next(ex);
  }
});

// ---------------- Admin Routes ----------------

app.get("/api/users", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const users = await fetchUser();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/users/:id", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await client.query(`DELETE FROM useradmin WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

app.patch("/api/users/:id", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, is_admin } = req.body;
    const SQL = `UPDATE useradmin SET first_name=$1, last_name=$2, email=$3, is_admin=$4 WHERE id=$5 RETURNING id, first_name, last_name, email, is_admin`;
    const result = await client.query(SQL, [first_name, last_name, email, is_admin, id]);
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------------- Error Handling ----------------
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// ---------------- Init ----------------
const init = async () => {
  const PORT = process.env.PORT || 3000;
  await createTable();
  await dbData();
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
};

init();