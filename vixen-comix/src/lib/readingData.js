// Saved spots and reading history, stored in Supabase tables `bookmarks` and
// `reading_history` (see supabase/migrations/0001_reading_progress.sql).
// The Supabase client is passed in so these functions also run against the
// dev mock in unit tests. No React and no import.meta here.

import { findChapter, findComic, getPage, readerPath } from './comics.js'

const HISTORY_FETCH_LIMIT = 50
export const RECENT_LIMIT = 10

function assertSpot({ comicSlug, chapterSlug, page }) {
  if (typeof comicSlug !== 'string' || !comicSlug || typeof chapterSlug !== 'string' || !chapterSlug) {
    throw new Error('A comic and a chapter are required.')
  }
  if (!Number.isInteger(page) || page < 1) throw new Error('The page must be a whole number of 1 or more.')
}

function fail(error) {
  throw new Error(error.message || 'Request failed')
}

// Returns { bookmarks: [{ comicSlug, chapterSlug, page, updatedAt }], history: [{ ..., lastReadAt }] }.
// History is newest first. Throws when the database returns an error.
export async function loadReading(client, userId) {
  const [bookmarkResult, historyResult] = await Promise.all([
    client
      .from('bookmarks')
      .select('comic_slug, chapter_slug, page, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    client
      .from('reading_history')
      .select('comic_slug, chapter_slug, page, last_read_at')
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(HISTORY_FETCH_LIMIT),
  ])
  if (bookmarkResult.error) fail(bookmarkResult.error)
  if (historyResult.error) fail(historyResult.error)
  return {
    bookmarks: (bookmarkResult.data ?? []).map((row) => ({
      comicSlug: row.comic_slug,
      chapterSlug: row.chapter_slug,
      page: row.page,
      updatedAt: row.updated_at,
    })),
    history: (historyResult.data ?? []).map((row) => ({
      comicSlug: row.comic_slug,
      chapterSlug: row.chapter_slug,
      page: row.page,
      lastReadAt: row.last_read_at,
    })),
  }
}

// One saved spot per comic: saving again replaces the earlier spot.
export async function saveBookmark(client, userId, spot) {
  assertSpot(spot)
  const { error } = await client.from('bookmarks').upsert(
    { user_id: userId, comic_slug: spot.comicSlug, chapter_slug: spot.chapterSlug, page: spot.page },
    { onConflict: 'user_id,comic_slug' },
  )
  if (error) fail(error)
}

// One history row per chapter: reading on moves the page and the time forward.
export async function recordHistory(client, userId, spot) {
  assertSpot(spot)
  const { error } = await client.from('reading_history').upsert(
    { user_id: userId, comic_slug: spot.comicSlug, chapter_slug: spot.chapterSlug, page: spot.page },
    { onConflict: 'user_id,comic_slug,chapter_slug' },
  )
  if (error) fail(error)
}

// Turns a stored row into something the page can show, or null when the comic,
// chapter or page no longer exists (the creator may rename or remove them) or
// the comic is not released yet.
export function resolveSpot(catalog, row) {
  const comic = findComic(catalog, row.comicSlug)
  if (!comic || comic.status === 'coming-soon') return null
  const chapter = findChapter(comic, row.chapterSlug)
  if (!chapter || !getPage(comic, row.chapterSlug, row.page)) return null
  return {
    comicSlug: comic.slug,
    comicTitle: comic.title,
    cover: comic.cover,
    chapterSlug: chapter.slug,
    chapterTitle: chapter.title,
    page: row.page,
    label: `${chapter.title}, page ${row.page}`,
    path: readerPath(comic.slug, chapter.slug, row.page),
  }
}

// { saved: [...one per comic, newest first], recent: [...newest first, at most RECENT_LIMIT] }
export function buildContinueList(catalog, bookmarks = [], history = []) {
  const saved = []
  for (const row of bookmarks) {
    const spot = resolveSpot(catalog, row)
    if (spot) saved.push({ ...spot, date: row.updatedAt })
  }
  const recent = []
  for (const row of history) {
    const spot = resolveSpot(catalog, row)
    if (spot) recent.push({ ...spot, date: row.lastReadAt })
  }
  const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)
  saved.sort(byDateDesc)
  recent.sort(byDateDesc)
  return { saved, recent: recent.slice(0, RECENT_LIMIT) }
}

// A short list for the home page: saved spots first, then the latest read of
// any other comic, up to `max` entries.
export function buildContinueStrip(list, max = 3) {
  const savedSlugs = new Set(list.saved.map((spot) => spot.comicSlug))
  const seen = new Set(savedSlugs)
  const extra = []
  for (const spot of list.recent) {
    if (seen.has(spot.comicSlug)) continue
    seen.add(spot.comicSlug)
    extra.push(spot)
  }
  return [...list.saved, ...extra].slice(0, max)
}
