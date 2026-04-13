import { useState } from "react";
import { registerUser } from "./api";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await registerUser(formData);
      console.log("Registered user:", result);
    } catch (err) {
      setError(err.message);
    }
  };

  const inputStyle = {
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div className="container mx-auto p-6" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="bg-white p-8 shadow-md" style={{ borderRadius: '16px' }}>
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#006b40' }}>Register to save your reading progress!</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                name="first_name"
                type="text"
                onChange={handleChange}
                placeholder="First name"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                name="last_name"
                type="text"
                onChange={handleChange}
                placeholder="Last name"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Enter your email"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Create a password"
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-purple-600 text-white hover:bg-purple-700 transition duration-200"
            style={{ 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: '600', 
              marginTop: '10px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Register
          </button>
          
          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', textAlign: 'center', marginTop: '10px' }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}