// server
// //index.js

// Import modules
import express from 'express';
import cors from 'cors';
// import path from 'path';

import client from './client.js';
import db from './db.js'; // NOTE: update import based on your actual file structure
import dbDataModule from './data.js';
import contactRoute from './contact.js';
const { createTable, createUser, authenticate, findUserByToken, fetchUser } = db;
const { dbData } = dbDataModule;

// Create an Express application
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/contact", contactRoute); // ✅ This enables your contact route handler

// Middleware to check if a user is logged in
const isLoggedIn = async ( req, res, next) => {
  try {
    const user = await findUserByToken(req.headers.authorization);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.is_admin) {
      next();
    } else {
      const error = new Error("Not authorized");
      error.status = 401;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

// Routes

// Register a new user
app.post("/api/auth/register", async (req, res, next) => {
  try {
    res.send(await createUser(req.body));
  } catch (err) {
    next(err);
  }
});

// Login user
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (err) {
    next(err);
  }
});

// Get current user
app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
  try {
    res.send({ user: req.user });
  } catch (err) {
    next(err);
  }
});

// Get all users (admin only)
app.get("/api/users", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    res.send(await fetchUser());
  } catch (err) {
    res.status(500).json({ error: "Failed to load users" });
    next(err);
  }
});

// Error handling middleware
app.use((err, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});
// DELETE /api/users/:id - admin only
app.delete("/api/users/:id", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const SQL = `DELETE FROM useradmin WHERE id = $1 RETURNING *`;
    const result = await client.query(SQL, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});
// PATCH /api/users/:id - admin only
app.patch("/api/users/:id", isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, is_admin } = req.body;

    // Validate input as needed...

    const SQL = `
      UPDATE useradmin
      SET first_name = $1, last_name = $2, email = $3, is_admin = $4
      WHERE id = $5
      RETURNING id, first_name, last_name, email, is_admin
    `;

    const values = [first_name, last_name, email, is_admin, id];

    const result = await client.query(SQL, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Init function
const init = async () => {
  const PORT = process.env.PORT || 3000;
  // await client.connect();
  console.log("Connected to database");

  await createTable();
  console.log("Table created");

  await dbData();
  console.log("Dummy data initialized");

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
};

// Start the app
init();
