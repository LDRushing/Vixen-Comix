import { useState } from "react";
import { loginUser } from "./api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(credentials);

      toast.success("Login successful!");
      localStorage.setItem("token", data.token);

      // Trigger parent state update
      if (onLogin) onLogin();

      // Redirect based on is_admin flag
      if (data.user?.is_admin) {
        navigate("/dashboard");  // admin panel
      } else {
        navigate("/");  // homepage
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) =>
          setCredentials({ ...credentials, email: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
      />
      <button type="submit">Login</button>
    </form>
  );
}
