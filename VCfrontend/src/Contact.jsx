import { useState } from "react";
import { toast } from "react-toastify"; 
import { sendContactForm } from "./api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "", 
    message: "",
  }); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendContactForm(form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" }); // Clear form
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div>
      <h2>Contact Me</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <textarea
          name="message"
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
