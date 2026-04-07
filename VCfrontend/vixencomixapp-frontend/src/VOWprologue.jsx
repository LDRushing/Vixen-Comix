import React from "react";
import { useParams, Link } from "react-router-dom";

export default function VOWprologue() {
  const { slug, chapter } = useParams();

  // For now, only handle vale-of-wales prologue (chapter 1)
  if (slug === "vale-of-wales" && chapter === "1") {
    return (
      <div className="container mx-auto p-6">
        <Link to={`/comics/${slug}`} className="text-purple-600 hover:underline mb-4 inline-block">&larr; Back to Table of Contents</Link>
        <h2 className="text-2xl font-bold mb-4">Prologue - Page 1</h2>
        <div className="flex justify-center">
          <img src="/prologue=page_1.jpg" alt="Prologue Page 1" className="max-w-full h-auto" />
        </div>
      </div>
    );
  }

  // Placeholder for other chapters
  return (
    <div className="container mx-auto p-6">
      <Link to={`/comics/${slug}`} className="text-purple-600 hover:underline mb-4 inline-block">&larr; Back to Table of Contents</Link>
      <h2 className="text-2xl font-bold mb-4">Chapter {chapter}</h2>
      <p>This chapter is not yet available.</p>
    </div>
  );
}