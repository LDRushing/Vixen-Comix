import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ComicTOC() {
  const { slug } = useParams();

  const comics = [
    {
      title: "The Vale of Wales",
      slug: "vale-of-wales",
      description: "One girl's perilous journey through the Welsh Otherworld, Annwn. Beware the Afanc King...",
      image: "/placeholder-comic1.jpg",
      chapters: ["Title Page", "Prologue", "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Chapter 6", "Chapter 7", "Chapter 8", "Chapter 9", "Chapter 10", "Chapter 11", "Chapter 12", "Chapter 13", "Chapter 14", "Chapter 15", "Chapter 16", "Chapter 17", "Chapter 18", "Chapter 19", "Chapter 20", "Chapter 21", "Chapter 22", "Chapter 23", "Chapter 24", "Chapter 25", "Chapter 26", "Chapter 27", "Chapter 28", "Chapter 29", "Chapter 30", "Epilogue"]},
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

  const comic = comics.find(c => c.slug === slug);

  if (!comic) {
    return <div className="container mx-auto p-6"><h2>Comic not found</h2></div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Link to="/comics" className="text-purple-600 hover:underline mb-4 inline-block">&larr; Back to Comics</Link>
      <h2 className="text-3xl font-bold mb-4">{comic.title}</h2>
      <img src={comic.image} alt="Comic cover" className="w-full max-w-md h-64 object-cover rounded mb-4" />
      <p className="text-gray-600 mb-8">{comic.description}</p>
      <h3 className="text-2xl font-semibold mb-4">Table of Contents</h3>
      <div className="grid grid-cols-3 gap-4">
    {comic.chapters.map((chapter, index) => (
  <div key={index} className="bg-gray-100 p-4 rounded">
    {/* index will be 0 for Title Page, 1 for Prologue, etc. */}
    <Link to={`/comics/${comic.slug}/chapter/${index}`} className="text-purple-600 hover:underline">
      {chapter}
    </Link>
  </div>
))}
      </div>
    </div>
  );
}