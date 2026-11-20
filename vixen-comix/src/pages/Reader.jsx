import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext.jsx";
import { useReading } from "../auth/ReadingContext.jsx";
import { useCatalog } from "../catalog/CatalogContext.jsx";
import { findComic, getPage, getPrevNext, parsePageSlug, readerPath } from "../lib/comics.js";
import NotFound from "./NotFound.jsx";
import Panel from "./Panel.jsx";

const MISSING_IMAGE = "/placeholders/page-missing.svg";
const HISTORY_DELAY_MS = 1500;

export default function Reader() {
  const { comicSlug, chapterSlug, pageSlug } = useParams();
  const { status, catalog } = useCatalog();

  const comic = status === "ready" ? findComic(catalog, comicSlug) : null;
  const comingSoon = comic?.status === "coming-soon";
  const pageNum = parsePageSlug(pageSlug);
  const page = comic && !comingSoon ? getPage(comic, chapterSlug, pageNum) : null;
  const { prev, next } = page ? getPrevNext(comic, chapterSlug, pageNum) : { prev: null, next: null };
  const nextImage = next ? getPage(comic, next.chapterSlug, next.pageNum)?.path : null;

  const { available, loading: authLoading, user } = useAuth();
  const { bookmarkFor, saveSpot, recordPage } = useReading();
  const [saving, setSaving] = useState(false);
  const userId = user?.id ?? null;
  const hasPage = Boolean(page);
  const readingSlug = comic?.slug ?? null;

  // Record the page in the reader's history once it has been on screen for a
  // moment. Turning pages quickly writes nothing; the timer is cleared on every
  // page change and when the reader leaves.
  useEffect(() => {
    if (!userId || !hasPage || !readingSlug) return undefined;
    const timer = setTimeout(() => {
      recordPage({ comicSlug: readingSlug, chapterSlug, page: pageNum });
    }, HISTORY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [userId, hasPage, readingSlug, chapterSlug, pageNum, recordPage]);

  // Start each page at the top (the Next button sits below the image).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [comicSlug, chapterSlug, pageSlug]);

  // Preload the next page so turning the page feels instant.
  useEffect(() => {
    if (!nextImage) return;
    const preload = new Image();
    preload.src = encodeURI(nextImage);
  }, [nextImage]);

  if (status === "loading") return <Panel>Loading page...</Panel>;
  if (status === "error") {
    return <Panel title="Comics are unavailable">We couldn't load the comics list. Please try again in a moment.</Panel>;
  }
  if (!comic) {
    return <NotFound message="That comic doesn't exist." />;
  }
  if (comingSoon) {
    return (
      <Panel
        title={`${comic.title} is coming soon`}
        links={[{ to: "/comics", label: "Back to Comics" }]}
      >
        There are no pages to read yet. Check back soon!
      </Panel>
    );
  }
  if (!page) {
    return (
      <NotFound
        message="That page doesn't exist. It may not be published yet."
        links={[{ to: `/comics/${comic.slug}`, label: "Table of Contents" }]}
      />
    );
  }

  const isFirstPage = !prev;
  const currentPath = readerPath(comic.slug, chapterSlug, pageNum);
  const savedSpot = bookmarkFor(comic.slug);
  const spotIsHere = Boolean(savedSpot) && savedSpot.chapterSlug === chapterSlug && savedSpot.page === pageNum;

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const saved = await saveSpot({ comicSlug: comic.slug, chapterSlug, page: pageNum });
    if (saved) toast.success(`Spot saved: ${page.title}`);
    setSaving(false);
  }

  let saveControl = null;
  if (!available) {
    saveControl = (
      <button type="button" className="hub-btn" disabled>
        Sign-in unavailable
      </button>
    );
  } else if (!authLoading && !user) {
    saveControl = (
      <Link to={`/login?next=${currentPath}`} className="hub-btn">
        Log in to save your spot
      </Link>
    );
  } else if (user) {
    saveControl = (
      <button type="button" className="hub-btn" onClick={handleSave} disabled={saving}>
        {spotIsHere ? "Spot saved" : "Save my spot"}
      </button>
    );
  }

  return (
    <div className="reader">
      <div className="reader-header">
        <Link to={`/comics/${comic.slug}`} className="hub-link">
          &larr; Table of Contents
        </Link>
        <h2 className="reader-title">{page.title}</h2>
      </div>

      <div className="reader-frame">
        <img
          key={page.path}
          src={encodeURI(page.path)}
          alt={`${comic.title}, ${page.title}`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = MISSING_IMAGE;
          }}
        />
      </div>

      {saveControl && <div className="reader-save">{saveControl}</div>}

      <div className="comic-nav-container">
        {prev ? (
          <Link to={readerPath(comic.slug, prev.chapterSlug, prev.pageNum)} className="comic-nav-btn">
            &larr; Previous
          </Link>
        ) : (
          <div className="nav-spacer"></div>
        )}
        {next ? (
          <Link to={readerPath(comic.slug, next.chapterSlug, next.pageNum)} className="comic-nav-btn">
            {isFirstPage ? "Begin" : "Next Page"} &rarr;
          </Link>
        ) : (
          <div className="comic-nav-btn" style={{ opacity: 0.5, cursor: "default" }}>
            To Be Continued...
          </div>
        )}
      </div>
    </div>
  );
}
