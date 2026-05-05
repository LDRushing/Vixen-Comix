import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";

export default function VOWprologue() {
  const { slug, chapter } = useParams();

  const currentChapter = useMemo(() => {
    const val = parseInt(chapter, 10);
    return isNaN(val) ? 0 : val;
  }, [chapter]);

  // NEW: Logic to find the right folder and filename
  const imageData = useMemo(() => {
    const COMING_SOON_URL = "https://64.media.tumblr.com/482bb929c9920a5703191f820df2f612/tumblr_pvwvr2jEjb1ytw60to1_1280.jpg";

    // Title Page - Coming Soon
    if (currentChapter === 0) {
      return {
        path: COMING_SOON_URL,
        title: "Title Page"
      };
    }

    // Prologue Pages (1-6)
    if (currentChapter >= 1 && currentChapter <= 6) {
      return {
        path: `/${slug}/prologue/page-${currentChapter}.jpg`,
        title: `Prologue - Page ${currentChapter}`
      };
    }

    // Any chapter page after the prologue
    if (currentChapter >= 7) {
      const chapterNumber = Math.floor((currentChapter - 7) / 21) + 1;
      const pageInChapter = currentChapter - 7 - (chapterNumber - 1) * 21 + 1;
      return {
        path: `/${slug}/chapter-${chapterNumber}/page-${pageInChapter}.jpg`,
        title:
          pageInChapter === 1
            ? `Chapter ${chapterNumber} Title Page`
            : `Chapter ${chapterNumber} - Page ${pageInChapter - 1}`
      };
    }

    return {
      path: COMING_SOON_URL,
      title: "Coming Soon"
    };
  }, [slug, currentChapter]);

  return (
    <div key={currentChapter} className="container mx-auto p-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Link to={`/comics/${slug}`} className="text-purple-600 hover:underline font-semibold">
          &larr; Table of Contents
        </Link>
        <h2 className="text-2xl font-bold" style={{ color: "#006b40" }}>
          {imageData.title}
        </h2>
      </div>

      {/* IMAGE */}
      <div className="flex justify-center bg-gray-900 p-2 rounded-lg shadow-2xl mb-8">
        <img
          src={imageData.path}
          alt={imageData.title}
          className="max-w-full h-auto"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x800?text=Page+Coming+Soon";
          }}
        />
      </div>

      {/* --- NAVIGATION SECTION --- */}
      <div className="comic-nav-container">
        {currentChapter > 0 ? (
          <Link
            to={`/comics/${slug}/chapter/${currentChapter - 1}`}
            className="comic-nav-btn"
          >
            &larr; Previous
          </Link>
        ) : (
          <div className="nav-spacer"></div> 
        )}

        {currentChapter < 27 ? (
          <Link
            to={`/comics/${slug}/chapter/${currentChapter + 1}`}
            className="comic-nav-btn"
          >
            {currentChapter === 0 ? "Begin" : "Next Page"} &rarr;
          </Link>
        ) : (
          <div className="comic-nav-btn" style={{ opacity: 0.5, cursor: 'default' }}>
            To Be Continued...
          </div>
        )}
      </div>
    </div>
  );
}
// To add future chapters, create a new folder (e.g., chapter-1).

// Drop in your page-x.jpg files.

// Add one more if statement to your imageData logic in VOWprologue.jsx.