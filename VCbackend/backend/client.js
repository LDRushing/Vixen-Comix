//client.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const client = new Client({
  connectionString: process.env.vixencomix,
});

await client.connect(); // ✅ connect once here

export default client;


