import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ name, email, message }) => {
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `Contact from ${name}`,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};
<form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
  <h2 className="text-2xl font-bold text-violet-800">Contact Me</h2>
  <input className="w-full p-2 border border-gray-300 rounded" placeholder="Your name" />
  <input className="w-full p-2 border border-gray-300 rounded" placeholder="Your email" />
  <textarea className="w-full p-2 border border-gray-300 rounded" placeholder="Your message" />
  <button className="w-full bg-violet-700 text-white py-2 px-4 rounded hover:bg-violet-900">Send</button>
</form>
