import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

// Second navigation row: Login / Register, or Continue Reading / Log out.
export default function AuthNav() {
  const { loading, user, signOut } = useAuth();
  const navigate = useNavigate();

  // Wait for the saved session to be read, so the links do not flash the wrong way round.
  if (loading) return null;

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="nav-row-links nav-row-auth flex justify-center mb-4 font-medium flex-wrap items-center">
      {user ? (
        <>
          <Link to="/continue-reading" className="nav-button">Continue Reading</Link>
          <button type="button" onClick={handleLogout} className="nav-button logout-button">Log out</button>
        </>
      ) : (
        <>
          <Link to="/login" className="nav-button">Login</Link>
          <Link to="/register" className="nav-button">Register</Link>
        </>
      )}
    </div>
  );
}
