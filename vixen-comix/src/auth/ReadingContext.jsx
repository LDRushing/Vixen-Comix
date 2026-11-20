import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext.jsx";
import { useCatalog } from "../catalog/CatalogContext.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { buildContinueList, loadReading, recordHistory, saveBookmark } from "../lib/readingData.js";

const EMPTY_LIST = { saved: [], recent: [] };
const NO_ROWS = [];

const ReadingContext = createContext({
  status: "idle",
  continueList: EMPTY_LIST,
  bookmarkFor: () => null,
  saveSpot: async () => false,
  recordPage: async () => false,
});

// Holds the signed-in reader's saved spots and history. Loaded once per login.
// Every failure is logged and shown as a toast; the reader keeps working.
export function ReadingProvider({ children }) {
  const { user } = useAuth();
  const { status: catalogStatus, catalog } = useCatalog();
  const userId = user?.id ?? null;

  // The rows remember whose they are, so a stale load can never show to someone else.
  const [loaded, setLoaded] = useState({ userId: null, bookmarks: [], history: [] });

  useEffect(() => {
    if (!userId || !supabase) return undefined;
    let active = true;
    loadReading(supabase, userId)
      .then((data) => {
        if (active) setLoaded({ userId, ...data });
      })
      .catch((error) => {
        console.error("Could not load your reading list", error);
        toast.error("Couldn't load your reading list. Please try again later.");
        if (active) setLoaded({ userId, bookmarks: [], history: [] });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const mine = userId !== null && loaded.userId === userId;
  const bookmarks = mine ? loaded.bookmarks : NO_ROWS;
  const history = mine ? loaded.history : NO_ROWS;
  const status = !userId ? "idle" : mine ? "ready" : "loading";

  const continueList = useMemo(
    () => (catalogStatus === "ready" ? buildContinueList(catalog, bookmarks, history) : EMPTY_LIST),
    [catalogStatus, catalog, bookmarks, history],
  );

  const bookmarkFor = useCallback(
    (comicSlug) => continueList.saved.find((spot) => spot.comicSlug === comicSlug) ?? null,
    [continueList],
  );

  const saveSpot = useCallback(
    async (spot) => {
      if (!userId || !supabase) return false;
      try {
        await saveBookmark(supabase, userId, spot);
      } catch (error) {
        console.error("Could not save the spot", error);
        toast.error("Couldn't save your spot. Please try again.");
        return false;
      }
      const row = { ...spot, updatedAt: new Date().toISOString() };
      setLoaded((previous) =>
        previous.userId !== userId
          ? previous
          : {
              ...previous,
              bookmarks: [row, ...previous.bookmarks.filter((existing) => existing.comicSlug !== spot.comicSlug)],
            },
      );
      return true;
    },
    [userId],
  );

  const recordPage = useCallback(
    async (spot) => {
      if (!userId || !supabase) return false;
      try {
        await recordHistory(supabase, userId, spot);
      } catch (error) {
        console.error("Could not record reading history", error);
        // One toast at a time, so a failing connection does not stack a toast per page.
        toast.error("Couldn't save your reading history. Please try again.", { toastId: "history-error" });
        return false;
      }
      const row = { ...spot, lastReadAt: new Date().toISOString() };
      setLoaded((previous) =>
        previous.userId !== userId
          ? previous
          : {
              ...previous,
              history: [
                row,
                ...previous.history.filter(
                  (existing) => !(existing.comicSlug === spot.comicSlug && existing.chapterSlug === spot.chapterSlug),
                ),
              ],
            },
      );
      return true;
    },
    [userId],
  );

  const value = useMemo(
    () => ({ status, continueList, bookmarkFor, saveSpot, recordPage }),
    [status, continueList, bookmarkFor, saveSpot, recordPage],
  );

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useReading() {
  return useContext(ReadingContext);
}
