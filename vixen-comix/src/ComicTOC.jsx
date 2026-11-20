import React from "react";
import { useParams, Link } from "react-router-dom";
import { useCatalog } from "./catalog/CatalogContext.jsx";
import { useReading } from "./auth/ReadingContext.jsx";
import { findComic, firstPagePath } from "./lib/comics.js";
import NotFound from "./pages/NotFound.jsx";
import Panel from "./pages/Panel.jsx";

const COMING_SOON_COVER = "/placeholders/coming-soon.svg";

export default function ComicTOC() {
  const { slug } = useParams();
  const { status, catalog } = useCatalog();
  const { bookmarkFor } = useReading();

  if (status === "loading") return <Panel>Loading comic...</Panel>;
  if (status === "error") {
    return <Panel title="Comics are unavailable">We couldn't load the comics list. Please try again in a moment.</Panel>;
  }

  const comic = findComic(catalog, slug);
  if (!comic) {
    return <NotFound title="Comic not found" message="That comic doesn't exist." />;
  }
  const comingSoon = comic.status === "coming-soon";
  const savedSpot = comingSoon ? null : bookmarkFor(comic.slug);

  return (
    <div className="hub-page">
      <Link to="/comics" className="hub-link hub-back">&larr; Back to Comics</Link>
      <h2 className="hub-title">{comic.title}</h2>
      <img
        src={encodeURI(comic.cover ?? COMING_SOON_COVER)}
        alt={`${comic.title} cover`}
        className={comic.cover ? "toc-cover" : "toc-cover toc-cover-placeholder"}
      />
      {comingSoon && <p><span className="badge-soon">Coming soon</span></p>}
      <p className="toc-description">{comic.description}</p>
      {savedSpot && (
        <p>
          <Link to={savedSpot.path} className="hub-btn">Continue: {savedSpot.label}</Link>
        </p>
      )}
      {comic.externalUrl && (
        <p>
          <a href={comic.externalUrl} target="_blank" rel="noreferrer" className="hub-link">
            Also on Tumblr
          </a>
        </p>
      )}
      {comingSoon ? (
        <Panel>Chapters will appear here once the first one is published. Check back soon!</Panel>
      ) : (
        <>
          <h3 className="toc-heading">Table of Contents</h3>
          <div className="toc-grid">
            {comic.chapters.map((chapter) => {
              const path = firstPagePath(comic, chapter.slug);
              return (
                <div key={chapter.slug} className="toc-item">
                  {path ? (
                    <Link to={path} className="hub-link">{chapter.title}</Link>
                  ) : (
                    <span className="toc-soon">{chapter.title} <span className="toc-soon-note">(Coming Soon)</span></span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
