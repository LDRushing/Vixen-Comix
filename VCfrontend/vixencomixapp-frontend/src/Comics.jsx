import React from "react";
import { Link } from "react-router-dom";

export default function Comics() {
  const comics = [
    { 
      title: "The Vale of Wales", 
      slug: "vale-of-wales",
      description: "One girl's perilous journey through the Welsh Otherworld, Annwn. Beware the Afanc King...", 
      image: "/5th anniversary300.jpg",
    },
    { 
      title: "Le Monstre Social", 
      slug: "le-monstre-social",
      description: "Set 50 years after The Vale of Wales, a werewolf detective in Paris, France teams up with a team of fellow monsters to protect humanity from the formidable Mademoiselle Croque and her boogiemen and women.", 
      image: "/placeholder-comic2.jpg",
    },
    { 
      title: "The War Dolls", 
      slug: "the-war-dolls",
      description: "Pursued by a malignant rat and his gang of cronies, a pair of talking dolls must survive the horrors of the Apocalypse.", 
      image: "/placeholder-comic3.jpg",
    },
  ];

  return (
    <div className="container mx-auto p-6" style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#006b40' }}>
        Let's Read Some Comics!
      </h2>
      <p className="text-center mb-12 text-gray-600 italic">
        From monsters to mysteries, we have something for you!
      </p>
      
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {comics.map((comic, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md overflow-hidden"
            style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'stretch', 
              border: '1px solid #e5e7eb',
              width: '100%'
            }}
          >
            {/* 1. IMAGE ON THE LEFT */}
            <div style={{ flex: '0 0 300px', backgroundColor: '#f3f4f6' }}>
              <img 
                src={comic.image} 
                alt={comic.title} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: 'block'
                }} 
              />
            </div>

            {/* 2. CONTENT ON THE RIGHT */}
            <div style={{ 
              flex: '1', 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center' 
            }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#1f2937' }}>
                {comic.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-lg mb-2">
                {comic.description}
                <Link 
                  to={`/comics/${comic.slug}`} 
                  className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 transition duration-200"
                  style={{ 
                    textDecoration: 'none', 
                    fontWeight: '600',
                    marginLeft: '15px',
                    fontSize: '0.9rem',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}
                >
                  Read Now
                </Link>
              </p>
            </div> 
          </div> /* End Comic Card Div */
        ))}
      </div> 
    </div> /* End Main Container Div */
  );
}