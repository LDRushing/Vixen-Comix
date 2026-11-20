import { Link } from "react-router-dom";
import { useCatalog } from "./catalog/CatalogContext.jsx";
import { useReading } from "./auth/ReadingContext.jsx";
import { buildContinueStrip } from "./lib/readingData.js";

const COMING_SOON_COVER = "/placeholders/coming-soon.svg";

export default function Home() {
  const { status, catalog } = useCatalog();
  const { continueList } = useReading();
  const strip = buildContinueStrip(continueList, 3);

  return (
    <div>
      <img src="/vixencomix 2026Shading.jpg" alt="Vixen Comix Print" style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div className="home-hero">
        <h2>Your home for webcomics, prints, and animation updates!</h2>
      </div>
      {strip.length > 0 && (
        <section className="home-comics home-continue" aria-labelledby="home-continue-heading">
          <h2 id="home-continue-heading" className="hub-title">Continue Reading</h2>
          <div className="home-comic-grid">
            {strip.map((spot) => (
              <Link key={spot.comicSlug} to={spot.path} className="home-comic-card">
                <img src={encodeURI(spot.cover ?? COMING_SOON_COVER)} alt="" />
                <span className="home-comic-title">{spot.comicTitle}</span>
                <span className="home-continue-where">{spot.label}</span>
              </Link>
            ))}
          </div>
          <p><Link to="/continue-reading" className="hub-link">See your whole reading list</Link></p>
        </section>
      )}
      {status === "ready" && catalog.comics.length > 0 && (
        <section className="home-comics">
          <h2 className="hub-title">Comics</h2>
          <div className="home-comic-grid">
            {catalog.comics.map((comic) => (
              <Link key={comic.slug} to={`/comics/${comic.slug}`} className="home-comic-card">
                <img src={encodeURI(comic.cover ?? COMING_SOON_COVER)} alt={comic.title} />
                <span className="home-comic-title">{comic.title}</span>
                {comic.status === "coming-soon" && <span className="badge-soon">Coming soon</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
