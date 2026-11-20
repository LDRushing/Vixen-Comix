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
import Reader from "./pages/Reader";
import { CatalogProvider } from "./catalog/CatalogContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./hub.css";
import { SiBluesky, SiX, SiInstagram } from "react-icons/si";

function App() {
  return (
    <Router>
      <CatalogProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Header Section */}
          <header className="art-header relative overflow-hidden">
            <div className="header-content relative z-10 text-center py-8 px-4">
              <h1 className="font-bold drop-shadow-lg tracking-wider">
                <span className="logo-yellow">Vixen Comix</span>
              </h1>
            </div>
          </header>

          {/* Navigation Section */}
          <nav className="vixen-nav-main shadow-lg">
            <div className="w-full px-8">
              <div className="nav-row-links flex justify-center mb-4 font-medium flex-wrap items-center">
                <Link to="/" className="nav-button">Home</Link>
                <Link to="/bio" className="nav-button">Bio</Link>
                <Link to="/comics" className="nav-button">Comics</Link>
                <Link to="/prints" className="nav-button">Prints</Link>
                <Link to="/film" className="nav-button">Film</Link>
                <Link to="/contact" className="nav-button">Contact</Link>
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="container mx-auto p-6 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/bio" element={<Bio />} />
              <Route path="/comics" element={<Comics />} />
              <Route path="/comics/:slug" element={<ComicTOC />} />
              <Route path="/:comicSlug/:chapterSlug/:pageSlug" element={<Reader />} />
              <Route path="/prints" element={<Prints />} />
              <Route path="/film" element={<Film />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <ToastContainer position="top-right" autoClose={3000} />

          {/* Footer Section */}
          <footer className="art-footer mt-auto bg-white border-t">
            <div className="footer-content py-10">
              <p className="footer-text">Follow Vixen Comix for updates and new releases</p>
              <div className="vixen-social-row">
                <a href="https://bsky.app/profile/vixencomix.bsky.social" target="_blank" rel="noreferrer"><SiBluesky size={35} /></a>
                <a href="https://twitter.com/vixencomix" target="_blank" rel="noreferrer"><SiX size={30} /></a>
                <a href="https://instagram.com/vixencomix816" target="_blank" rel="noreferrer"><SiInstagram size={35} /></a>
              </div>
              <p className="copyright-text">© 2026 Vixen Comix</p>
            </div>
          </footer>
        </div>
      </CatalogProvider>
    </Router>
  );
}

export default App;
