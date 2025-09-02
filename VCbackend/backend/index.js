// server/index.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

import client from "./client.js";
import db from "./db.js";
import dbDataModule from "./data.js";
import contactRoute from "./contact.js";

const { createTable, createUser, authenticate, findUserByToken, fetchUser } = db;
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
    const token = req.headers.authorization;
    if (!token) throw new Error("Not authorized");

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
  const err = new Error("Not authorized");
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

    const existingUser = await client.query(
      "SELECT * FROM useradmin WHERE email = $1",
      [email]
    );
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const newUser = await createUser({ first_name, last_name, email, password });

    res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      is_admin: newUser.is_admin,
    });
  } catch (err) {
    console.error("🔥 Register error:", err.message);
    next(err);
  }
});

// Login
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const authResult = await authenticate({ email, password });

    if (!authResult) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: authResult.id, is_admin: authResult.is_admin },
      process.env.JWT_SECRET || "vixencomix",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      user: {
        id: authResult.id,
        first_name: authResult.first_name,
        last_name: authResult.last_name,
        email: authResult.email,
        is_admin: authResult.is_admin,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", err.message);
    next(err);
  }
});

// Fetch all users (admin only)
app.get("/api/users", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const users = await fetchUser();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// DELETE user (admin only)
app.delete("/api/users/:id", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const SQL = `DELETE FROM useradmin WHERE id = $1 RETURNING *`;
    const result = await client.query(SQL, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH user (admin only)
app.patch("/api/users/:id", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, is_admin } = req.body;

    const SQL = `
      UPDATE useradmin
      SET first_name=$1, last_name=$2, email=$3, is_admin=$4
      WHERE id=$5
      RETURNING id, first_name, last_name, email, is_admin
    `;
    const values = [first_name, last_name, email, is_admin, id];
    const result = await client.query(SQL, values);

    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });

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

  console.log("Connected to database");
  await createTable();
  console.log("Table created");
  await dbData();
  console.log("Dummy data initialized");

  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
};

init();