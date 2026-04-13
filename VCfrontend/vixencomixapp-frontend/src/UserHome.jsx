//UserHome.jsx

import React, { useEffect, useState } from "react";
import { getProgress } from "./api";

export default function UserHome({ user }) {
  const [readingList, setReadingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      const fetchMyProgress = async () => {
        try {
          const data = await getProgress();
          // Ensure we always have an array, even if data is null/undefined
          setReadingList(data || []);
        } catch (err) {
          /**
           * THE FIX: If the error message is "Failed to fetch progress" (from our 204 handler),
           * we ignore it. Otherwise, we log the actual error.
           */
          if (err.message !== "Failed to fetch progress") {
            console.error("Error fetching progress:", err);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchMyProgress();
    }
  }, [user]);

  // 1. Guard Clause: Wait for user data to load
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-purple-600 font-bold">Loading your library...</p>
      </div>
    );
  }

  // 2. Final Render
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4" style={{ color: '#006b40' }}>
        Welcome back, {user.first_name}!
      </h1>

      {/* Admin Quick-Link Banner */}
      {user.is_admin && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-xl flex justify-between items-center shadow-sm">
          <p className="text-yellow-800">
            <strong>Admin Portal:</strong> You have supervisor access to manage users and site data.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 transition font-bold text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Your Reading Progress</h3>
        
        {loading ? (
          <p className="text-gray-500">Updating your bookmarks...</p>
        ) : readingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readingList.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 shadow-md transition hover:shadow-xl" 
                style={{ borderRadius: '16px', borderLeft: '8px solid #006b40' }}
              >
                <h4 className="text-lg font-bold uppercase tracking-wide text-purple-900">
                  {item.comic_slug.replace(/-/g, ' ')}
                </h4>
                <p className="text-gray-600 mb-4 mt-1">You are on Chapter {item.last_chapter_index + 1}</p>
                
                <button 
                  className="w-full bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 transition"
                  style={{ borderRadius: '12px', fontWeight: '600' }}
                  onClick={() => window.location.href = `/comics/${item.comic_slug}`}
                >
                  Continue Reading
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-10 text-center border-2 border-dashed border-gray-300" style={{ borderRadius: '16px' }}>
            <p className="text-gray-600 mb-4">You haven't started any adventures yet!</p>
            <button 
              className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition"
              onClick={() => window.location.href = '/comics'}
            >
              Browse Comics
            </button>
          </div>
        )}
      </section>
    </div>
  );
}