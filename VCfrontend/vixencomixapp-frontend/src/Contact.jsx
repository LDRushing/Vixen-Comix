import React from "react"; 
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
    <div className="container mx-auto p-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#006b40' }}>Contact Me</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Name Input */}
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
          style={{
            padding: '12px 15px',
            borderRadius: '12px', // More rounded edges
            border: '1px solid #e5e7eb',
            fontSize: '1rem'
          }}
        />
        
        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            padding: '12px 15px',
            borderRadius: '12px', // More rounded edges
            border: '1px solid #e5e7eb',
            fontSize: '1rem'
          }}
        />
        
        {/* Message Textarea */}
        <textarea
          name="message"
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          required
          style={{
            padding: '12px 15px',
            borderRadius: '12px', // More rounded edges
            border: '1px solid #e5e7eb',
            fontSize: '1rem',
            minHeight: '150px'
          }}
        />
        
        {/* Button with space created by the gap in the form container */}
        <button 
          type="submit"
          className="bg-purple-600 text-white hover:bg-purple-700 transition duration-200"
          style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            fontWeight: '600',
            marginTop: '10px', // Extra space specifically for the button
            cursor: 'pointer'
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}