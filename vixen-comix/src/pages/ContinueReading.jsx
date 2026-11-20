import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useReading } from "../auth/ReadingContext.jsx";
import { useCatalog } from "../catalog/CatalogContext.jsx";
import Panel from "./Panel.jsx";

const COMING_SOON_COVER = "/placeholders/coming-soon.svg";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ContinueReading() {
  const { available, loading, user } = useAuth();
  const { status, continueList } = useReading();
  const { status: catalogStatus } = useCatalog();

  if (!available) {
    return (
      <Panel title="Sign-in is unavailable right now" links={[{ to: "/comics", label: "Back to Comics" }]}>
        Your Continue Reading list needs an account, and sign-in is not available at the moment. You can still read every comic.
      </Panel>
    );
  }
  if (loading) return <Panel>Loading...</Panel>;
  if (!user) return <Navigate to="/login?next=/continue-reading" replace />;
  if (status !== "ready" || catalogStatus === "loading") return <Panel>Loading your reading list...</Panel>;
  if (catalogStatus === "error") {
    return <Panel title="Comics are unavailable">We couldn't load the comics list. Please try again in a moment.</Panel>;
  }

  const { saved, recent } = continueList;

  return (
    <div className="hub-page continue-page">
      <h2 className="hub-title">Continue Reading</h2>
      <p className="hub-subtitle">This list is private to you. Only you can see your saved spots and what you have read.</p>

      <section aria-labelledby="saved-heading">
        <h3 id="saved-heading" className="toc-heading">Saved spots</h3>
        {saved.length === 0 ? (
          <p className="continue-empty">
            No saved spots yet. Choose Save my spot while you read, and it will show up here.{" "}
            <Link to="/comics" className="hub-link">Find a comic to read</Link>
          </p>
        ) : (
          <ul className="continue-list">
            {saved.map((spot) => (
              <li key={spot.comicSlug} className="continue-card">
                <img src={encodeURI(spot.cover ?? COMING_SOON_COVER)} alt="" className="continue-cover" />
                <div className="continue-body">
                  <h4 className="continue-title">{spot.comicTitle}</h4>
                  <p className="continue-where">{spot.label}</p>
                  <p className="continue-date">Saved {formatDate(spot.date)}</p>
                  <Link to={spot.path} className="hub-btn">Continue</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="recent-heading">
        <h3 id="recent-heading" className="toc-heading">Recently read</h3>
        {recent.length === 0 ? (
          <p className="continue-empty">
            Nothing here yet. Chapters you read while logged in will appear here.
          </p>
        ) : (
          <ul className="recent-list">
            {recent.map((spot) => (
              <li key={`${spot.comicSlug}/${spot.chapterSlug}`} className="recent-item">
                <div>
                  <span className="recent-title">{spot.comicTitle}</span>
                  <span className="recent-where">{spot.label}</span>
                  <span className="continue-date">{formatDate(spot.date)}</span>
                </div>
                <Link to={spot.path} className="hub-link">Read</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
