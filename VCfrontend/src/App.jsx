import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from './Home'; 
import Bio from './Bio';
import Comics from './Comics'; 
import Prints from './Prints'; 
import Film from './Film';
import Contact from './Contact'; 
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import UserSession from "./UserSession";
import { getCurrentUser } from "./api";
import "./App.css";
import UserManagement from "./UserManagement";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);

  const isLoggedIn = !!token;
  const isAdmin = currentUser?.is_admin;

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { user } = await getCurrentUser();
          setCurrentUser(user);
        } catch {
          setCurrentUser(null);
        }
      }
    };
    loadUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCurrentUser(null);
  };

  const handleLogin = () => {
    const newToken = localStorage.getItem("token");
    setToken(newToken);
  };

  return (
    <Router>
      <div className="App">
        <h1>Welcome to Vixen Comix!</h1>
        <h2>Your home for webcomics, prints, and animation updates.</h2>
        <nav>
          <Link to="/">Home</Link> | <Link to="/bio">Bio</Link> | <Link to="/comics">Comics</Link> | <Link to="/prints">Prints</Link> | <Link to="/film">Film</Link> | <Link to="/contact">Contact</Link>
          {!isLoggedIn && (
            <> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link></>
          )}
          {isLoggedIn && isAdmin && (
            <> | <Link to="/dashboard">Dashboard</Link> | <Link to="/users">Manage Users</Link></>
          )}
        </nav>

        {isLoggedIn && <UserSession onLogout={handleLogout} />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/comics" element={<Comics />} />
          <Route path="/prints" element={<Prints />} />
          <Route path="/film" element={<Film />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn && isAdmin
                ? <AdminDashboard />
                : <p style={{ color: "red" }}>🚫 Not authorized to view this page</p>
            }
          />
          <Route
            path="/users"
            element={
              isLoggedIn && isAdmin
                ? <UserManagement />
                : <p style={{ color: "red" }}>🚫 Not authorized to view this page</p>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
<ToastContainer position="top-right" autoClose={3000} />

export default App;

