import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_KEY);

export const sendMail = async ({ name, email, message }) => {
  await resend.emails.send({
    from: "faeriecongress@vixencomix.com",
    to: "rushinglucy@yahoo.com",
    reply_to: email,
    subject: `Contact from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
  });
};
<form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
  <h2 className="text-2xl font-bold text-violet-800">Contact Me</h2>
  <input className="w-full p-2 border border-gray-300 rounded" placeholder="Your name" />
  <input className="w-full p-2 border border-gray-300 rounded" placeholder="Your email" />
  <textarea className="w-full p-2 border border-gray-300 rounded" placeholder="Your message" />
  <button className="w-full bg-violet-700 text-white py-2 px-4 rounded hover:bg-violet-900">Send</button>
</form>
