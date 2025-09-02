// hash.js
import bcrypt from "bcrypt";

const password = "mabb816"; // your test password
const saltRounds = 10;

const run = async () => {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("✅ Hashed password:", hash);
};

run();
