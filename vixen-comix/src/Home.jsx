import { Link } from "react-router-dom";
import { useCatalog } from "./catalog/CatalogContext.jsx";

const COMING_SOON_COVER = "/placeholders/coming-soon.svg";

export default function Home() {
  const { status, catalog } = useCatalog();

  return (
    <div>
      <img src="/vixencomix 2026Shading.jpg" alt="Vixen Comix Print" style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div className="home-hero">
        <h2>Your home for webcomics, prints, and animation updates!</h2>
      </div>
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
