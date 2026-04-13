import React from "react";
import { Link } from "react-router-dom";

export default function Comics() {
  const comics = [
    { 
      title: "The Vale of Wales", 
      slug: "vale-of-wales",
      description: "One girl's perilous journey through the Welsh Otherworld, Annwn. Beware the Afanc King...", 
      image: "/5th anniversary.jpg",
      chapters: ["Chapter 1: The Crossing", "Chapter 2: Annwn's Gate", "Chapter 3: The Afanc King"]
    },
    { 
      title: "Le Monstre Social", 
      slug: "le-monstre-social",
      description: "Set 50 years after The Vale of Wales, a werewolf detective in Paris, France teams up with a team of fellow monsters to protect humanity from the formidable Mademoiselle Croque and her boogiemen and women.", 
      image: "/placeholder-comic2.jpg",
      chapters: ["Chapter 1: The Full Moon", "Chapter 2: Paris Nights", "Chapter 3: Mademoiselle Croque"]
    },
    { 
      title: "The War Dolls", 
      slug: "the-war-dolls",
      description: "Pursued by a malignant rat and his gang of cronies, a pair of talking dolls must survive the horrors of the Apocalypse.", 
      image: "/placeholder-comic3.jpg",
      chapters: ["Chapter 1: The Rat's Pursuit", "Chapter 2: Doll's Escape", "Chapter 3: Apocalypse Horrors"]
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Let's Read Some Comics!</h2>
      <p className="text-center mb-8">From monsters to mysteries, we have something for you!</p>
      
      {/* Special layout for The Vale of Wales */}
      <div className="vale-of-wales-featured mb-12">
        <h3 className="text-3xl font-bold mb-6 text-center text-gray-800">The Vale of Wales</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex gap-6 p-6 items-start">
            <div className="flex-shrink-0 w-32">
              <img 
                src="/5th anniversary300.jpg" 
                alt="The Vale of Wales - 5th Anniversary" 
                className="w-full max-h-32 h-auto rounded-lg shadow-sm object-contain" 
              />
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                One girl's perilous journey through the Welsh Otherworld, Annwn. Beware the Afanc King...
              </p>
              <Link 
                to="/comics/vale-of-wales" 
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200 self-start"
              >
                Read Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Other comics in grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comics.slice(1).map((comic, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <img src={comic.image} alt="Comic cover" className="w-full h-48 object-cover rounded mb-4" />
            <h3 className="text-xl font-semibold mb-2">{comic.title}</h3>
            <p className="text-gray-600">{comic.description}</p>
            <Link to={`/comics/${comic.slug}`} className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Read Now</Link>
          </div>
        ))}
      </div>
    </div>
  );
}