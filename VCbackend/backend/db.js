// db.js
import client from './client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT = process.env.JWT || 'vixencomix';

// Create user table
const createTable = async () => {
  await client.query(`DROP TABLE IF EXISTS useradmin;`);
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
  // await client.query(SQL);
};

// Create a new user
const createUser = async ({ id, first_name, last_name, email, password, is_admin }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const SQL = `
    INSERT INTO useradmin (id, first_name, last_name, email, password, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    id || uuidv4(),
    first_name,
    last_name,
    email,
    hashedPassword,
    is_admin || true,
  ]);
  console.log("New user created:", response.rows[0]);
  return response.rows[0];
};

// Authenticate user
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

  // Return the full user object
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_admin: user.is_admin,
  };
};

// Find user by token
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
  const SQL = `
    SELECT id, first_name, last_name, email, is_admin FROM useradmin WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    const error = Error("Not Authorized");
    error.status = 401;
    throw error;
  }
  return response.rows[0];
};

// Fetch all users
const fetchUser = async () => {
  const SQL = `SELECT id, first_name, last_name, email, is_admin FROM useradmin`;
  const result = await client.query(SQL);
  return result.rows;
};

export default { createUser, createTable, authenticate, findUserByToken, fetchUser };
