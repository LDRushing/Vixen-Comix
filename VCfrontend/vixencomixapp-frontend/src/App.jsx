import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Home from "./Home";
import Bio from "./Bio";
import Comics from "./Comics";
import ComicTOC from "./ComicTOC";
import Prints from "./Prints";
import Film from "./Film";
import Contact from "./Contact";
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";
import UserHome from "./UserHome";
import UserSession from "./UserSession";
import UserManagement from "./UserManagement";
import VOWprologue from "./VOWprologue";
import { getCurrentUser } from "./api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { SiBluesky, SiX, SiInstagram } from "react-icons/si";

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
          handleLogout();
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
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header Section */}
        <header className="art-header relative overflow-hidden">
          <div className="header-content relative z-10 text-center py-8 px-4">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg uppercase tracking-wider">
              <Link to="/" className="text-white no-underline hover:opacity-90 transition">
                Vixen Comix
              </Link>
            </h1>
          </div>
        </header>

        {/* Navigation Section */}
        <nav className="bg-purple-600 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            
            {/* Row 1: Main Site Links with horizontal spacing */}
            <div className="flex justify-center gap-6 mb-4 font-medium flex-wrap items-center">
              <Link to="/" className="nav-button">Home</Link>
              <Link to="/bio" className="nav-button">Bio</Link>
              <Link to="/comics" className="nav-button">Comics</Link>
              <Link to="/prints" className="nav-button">Prints</Link>
              <Link to="/film" className="nav-button">Film</Link>
              <Link to="/contact" className="nav-button">Contact</Link>
              
              {isLoggedIn && (
                <Link to="/home" className="nav-button special-nav">
                  My Reading
                </Link>
              )}
            </div>

            {/* Row 2: Auth and Admin Actions with vertical spacing and separator */}
            <div className="flex justify-center gap-4 items-center flex-wrap mt-6 pt-4 border-t border-purple-500/30">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="nav-button">Login</Link>
                  <Link to="/register" className="nav-button">Register</Link>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <>
                      <Link to="/dashboard" className="nav-button admin-nav">
                        Admin Dashboard
                      </Link>
                      <Link to="/users" className="nav-button admin-nav">
                        Manage Users
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="nav-button logout-button">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* {isLoggedIn && <UserSession onLogout={handleLogout} />} */}

        {/* Main Content Area */}
        <main className="container mx-auto p-6 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isLoggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />}
            />
            <Route
              path="/register"
              element={isLoggedIn ? <Navigate to="/home" /> : <Register />}
            />
            <Route
              path="/home"
              element={isLoggedIn ? <UserHome user={currentUser} /> : <Navigate to="/login" />}
            />
            <Route path="/bio" element={<Bio />} />
            <Route path="/comics" element={<Comics />} />
            <Route path="/comics/:slug" element={<ComicTOC />} />
            <Route path="/comics/:slug/chapter/:chapter" element={<VOWprologue />} />
            <Route path="/prints" element={<Prints />} />
            <Route path="/film" element={<Film />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/home" />}
            />
            <Route
              path="/users"
              element={isAdmin ? <UserManagement /> : <Navigate to="/home" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <ToastContainer position="top-right" autoClose={3000} />

        {/* Footer Section */}
        <footer className="art-footer mt-auto bg-white border-t">
          <div className="footer-content py-10">
            <p className="footer-text">Follow Vixen Comix for updates and new releases</p>
            <div className="vixen-social-row">
              <a href="https://bsky.app/profile/vixencomix.bsky.social" target="_blank" rel="noreferrer">
                <SiBluesky size={35} />
              </a>
              <a href="https://twitter.com/vixencomix" target="_blank" rel="noreferrer">
                <SiX size={30} />
              </a>
              <a href="https://instagram.com/vixencomix816" target="_blank" rel="noreferrer">
                <SiInstagram size={35} />
              </a>
            </div>
            <p className="copyright-text">© 2026 Vixen Comix</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;