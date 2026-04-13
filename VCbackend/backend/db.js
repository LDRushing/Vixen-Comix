// db.js
import client from "./client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const JWT = process.env.JWT || "vixencomix";

const createTable = async () => {
  // 1. Drop in correct order (Progress depends on UserAdmin)
  await client.query(`DROP TABLE IF EXISTS user_progress;`);
  await client.query(`DROP TABLE IF EXISTS useradmin;`);

  // 2. Create User Table
  await client.query(`
    CREATE TABLE useradmin (
      id UUID PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE
    );
  `);

  // 3. Create Progress Table (Corrected for UUID)
  await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  await client.query(`
    CREATE TABLE user_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES useradmin(id) ON DELETE CASCADE,
      comic_slug VARCHAR(255) NOT NULL,
      last_chapter_index INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, comic_slug)
    );
  `);
};

// --- USER FUNCTIONS ---

const createUser = async ({
  id,
  first_name,
  last_name,
  email,
  password,
  is_admin,
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const SQL = `
    INSERT INTO useradmin (id, first_name, last_name, email, password, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, first_name, last_name, email, is_admin;
  `;
  const response = await client.query(SQL, [
    id || uuidv4(),
    first_name,
    last_name,
    email,
    hashedPassword,
    is_admin ?? false,
  ]);
  return response.rows[0];
};

const authenticate = async ({ email, password }) => {
  const SQL = `SELECT * FROM useradmin WHERE email = $1`;
  const response = await client.query(SQL, [email]);

  if (!response.rows.length) {
    const error = new Error("Not Authorized");
    error.status = 401;
    throw error;
  }

  const user = response.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Not Authorized");
    error.status = 401;
    throw error;
  }

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_admin: user.is_admin,
  };
};

const findUserByToken = async (token) => {
  let id;
  try {
    const payload = jwt.verify(token, JWT);
    id = payload.id;
  } catch (err) {
    const error = Error("Not Authorized");
    error.status = 401;
    throw error;
  }
  const SQL = `SELECT id, first_name, last_name, email, is_admin FROM useradmin WHERE id = $1`;
  const response = await client.query(SQL, [id]);
  return response.rows[0];
};

const fetchUser = async () => {
  const SQL = `SELECT id, first_name, last_name, email, is_admin FROM useradmin`;
  const result = await client.query(SQL);
  return result.rows;
};

// --- PROGRESS FUNCTIONS ---

const saveOrUpdateProgress = async ({
  user_id,
  comic_slug,
  last_chapter_index,
}) => {
  const SQL = `
    INSERT INTO user_progress (user_id, comic_slug, last_chapter_index)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, comic_slug) 
    DO UPDATE SET last_chapter_index = $3, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    user_id,
    comic_slug,
    last_chapter_index,
  ]);
  return response.rows[0];
};

const fetchProgressByUser = async (user_id) => {
  const SQL = `SELECT * FROM user_progress WHERE user_id = $1`;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

export default {
  createUser,
  createTable,
  authenticate,
  findUserByToken,
  fetchUser,
  saveOrUpdateProgress,
  fetchProgressByUser,
};
