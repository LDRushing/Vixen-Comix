import React from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "./catalog/CatalogContext.jsx";
import Panel from "./pages/Panel.jsx";

const COMING_SOON_COVER = "/placeholders/coming-soon.svg";

export default function Comics() {
  const { status, catalog } = useCatalog();

  if (status === "loading") return <Panel>Loading comics...</Panel>;
  if (status === "error") {
    return <Panel title="Comics are unavailable">We couldn't load the comics list. Please try again in a moment.</Panel>;
  }

  return (
    <div className="hub-page">
      <h2 className="hub-title">Let's Read Some Comics!</h2>
      <p className="hub-subtitle">From monsters to mysteries, we have something for you!</p>
      <div className="comic-list">
        {catalog.comics.map((comic) => {
          const comingSoon = comic.status === "coming-soon";
          return (
            <div key={comic.slug} className="comic-card">
              <div className="comic-card-cover">
                <img src={encodeURI(comic.cover ?? COMING_SOON_COVER)} alt={comic.title} />
              </div>
              <div className="comic-card-body">
                <h3 className="comic-card-title">{comic.title}</h3>
                {comingSoon && <span className="badge-soon">Coming soon</span>}
                <p className="comic-card-description">{comic.description}</p>
                {comingSoon ? (
                  <Link to={`/comics/${comic.slug}`} className="hub-link">
                    About this comic
                  </Link>
                ) : (
                  <Link to={`/comics/${comic.slug}`} className="hub-btn">
                    Read Now
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
