import { useState } from "react";
import { registerUser } from "./api";
import { toast } from "react-toastify";


export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    is_admin: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      alert("Registration successful! Please log in.");
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        placeholder="First Name"
        value={formData.first_name}
        onChange={(e) =>
          setFormData({ ...formData, first_name: e.target.value })
        }
      />
      <input
        placeholder="Last Name"
        value={formData.last_name}
        onChange={(e) =>
          setFormData({ ...formData, last_name: e.target.value })
        }
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={formData.is_admin}
          onChange={(e) =>
            setFormData({ ...formData, is_admin: e.target.checked })
          }
        />
        Admin?
      </label>
      <button type="submit">Register</button>
    </form>
  );
}
