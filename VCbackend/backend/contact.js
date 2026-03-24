// backend/routes/contact.js
import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config(); // ✅ this works with type: "module"

const resend = new Resend(process.env.RESEND_KEY);
const router = express.Router();

router.post("/", async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await resend.emails.send({
      from: "faeriecongress@vixencomix.com",
      to: "rushinglucy@yahoo.com",
      reply_to: email,
      subject: `New message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    });

    res.status(200).json({ message: "Message sent" });
  } catch (err) {
    console.error("Contact form error:", err);
    next(err); // pass to global error handler
  }
});

export default router;

