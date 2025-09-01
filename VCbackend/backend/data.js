//data.js
// data.js
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
const { createUser } = db;

const dbData = async () => {
  try {
    const user = await createUser({
      id: uuidv4(),
      first_name: "Lucy",
      last_name: "Rushing",
      email: "rushinglucy@yahoo.com",
      password: "Dargan816", // will be hashed inside createUser
      is_admin: true
    });

    console.log("Dummy admin user created in user:", user);
    return { user };
  } catch (err) {
    console.error("Error initializing dummy data in user:", err);
  }
};

export default { dbData };

