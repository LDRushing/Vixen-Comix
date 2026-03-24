// App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from './Home'; 
import Bio from './Bio';
import Comics from './Comics'; 
import ComicTOC from './ComicTOC';
import Prints from './Prints'; 
import Film from './Film';
import Contact from './Contact'; 
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import UserSession from "./UserSession";
import UserManagement from "./UserManagement";
import { getCurrentUser } from "./api";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);

  const isLoggedIn = !!token;
  const isAdmin = currentUser?.is_admin;

  // Load current user whenever token changes
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { user } = await getCurrentUser();
          setCurrentUser(user);
        } catch {
          setCurrentUser(null);
          setToken("");
          localStorage.removeItem("token");
        }
      }
    };
    loadUser();
  }, [token]);

  const handleLogin = (result) => {
    if (result?.token) {
      localStorage.setItem("token", result.token);
      setToken(result.token);
    }
    if (result?.user) {
      setCurrentUser(result.user);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-purple-800 text-white p-4">
          <h1 className="text-3xl font-bold text-center">Welcome to Vixen Comix! 🦊</h1>
        </header>
        <nav className="bg-purple-600 text-white p-4">
          <div className="container mx-auto flex justify-center space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/bio" className="hover:underline">Bio</Link>
            <Link to="/comics" className="hover:underline">Comics</Link>
            <Link to="/prints" className="hover:underline">Prints</Link>
            <Link to="/film" className="hover:underline">Film</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            {!isLoggedIn && (
              <>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/register" className="hover:underline">Register</Link>
              </>
            )}
            {isLoggedIn && isAdmin && (
              <>
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                <Link to="/users" className="hover:underline">Manage Users</Link>
              </>
            )}
          </div>
        </nav>

        {isLoggedIn && <UserSession onLogout={handleLogout} />}

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bio" element={<Bio />} />
            <Route path="/comics" element={<Comics />} />
            <Route path="/comics/:slug" element={<ComicTOC />} />
            <Route path="/prints" element={<Prints />} />
            <Route path="/film" element={<Film />} />
            <Route path="/contact" element={<Contact />} />

            {/* Login & Register Routes */}
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to={isAdmin ? "/dashboard" : "/"} /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to={isAdmin ? "/dashboard" : "/"} /> : <Register />}
            />

            {/* Admin Routes */}
            <Route
              path="/dashboard"
              element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/users"
              element={isLoggedIn && isAdmin ? <UserManagement /> : <Navigate to="/" />}
            />
          </Routes>
        </main>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
