// backend/routes/contact.js
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // ✅ this works with type: "module"


const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("All fields are required");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // NOTE: Use an app password for Gmail
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      text: message,
    });

    res.status(200).send("Message sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send email");
  }
});

export default router;

