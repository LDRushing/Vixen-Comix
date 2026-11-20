// Pure helpers for the comics catalog (public/comics.json).
// No React and no import.meta here so `node --test` can load this file.

const STATUSES = ['ongoing', 'complete', 'coming-soon']
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/

function isSlug(value) {
  return typeof value === 'string' && SLUG_PATTERN.test(value)
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\/\S+$/i.test(value)
}

function normalizeChapter(raw, comicSlug, seen) {
  if (!raw || typeof raw !== 'object' || !isSlug(raw.slug)) {
    console.warn(`comics.json: ignoring chapter with a missing or invalid slug in "${comicSlug}"`)
    return null
  }
  if (seen.has(raw.slug)) {
    console.warn(`comics.json: ignoring duplicate chapter slug "${raw.slug}" in "${comicSlug}"`)
    return null
  }
  seen.add(raw.slug)
  const rawPages = Array.isArray(raw.pages) ? raw.pages : []
  const pages = rawPages.filter((page) => {
    const ok = typeof page === 'string' && page.length > 0
    if (!ok) console.warn(`comics.json: ignoring a non-text page entry in "${comicSlug}/${raw.slug}"`)
    return ok
  })
  const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title : raw.slug
  return { slug: raw.slug, title, pages }
}

function normalizeComic(raw, seen) {
  if (!raw || typeof raw !== 'object' || !isSlug(raw.slug)) {
    console.warn('comics.json: ignoring comic with a missing or invalid slug')
    return null
  }
  if (seen.has(raw.slug)) {
    console.warn(`comics.json: ignoring duplicate comic slug "${raw.slug}"`)
    return null
  }
  if (!STATUSES.includes(raw.status)) {
    console.warn(`comics.json: ignoring comic "${raw.slug}" with unknown status "${raw.status}"`)
    return null
  }
  seen.add(raw.slug)
  const chapterSlugs = new Set()
  const chapters = (Array.isArray(raw.chapters) ? raw.chapters : [])
    .map((chapter) => normalizeChapter(chapter, raw.slug, chapterSlugs))
    .filter(Boolean)
  const comic = {
    slug: raw.slug,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : raw.slug,
    status: raw.status,
    description: typeof raw.description === 'string' ? raw.description : '',
    cover: typeof raw.cover === 'string' && raw.cover ? raw.cover : null,
    chapters,
  }
  if (isHttpUrl(raw.externalUrl)) comic.externalUrl = raw.externalUrl
  return comic
}

// Returns { comics: [...] } with bad entries dropped (each drop logs a console.warn).
// Throws only when the file is not shaped like { "comics": [...] } at all.
export function normalizeCatalog(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.comics)) {
    throw new Error('comics.json must be an object with a "comics" list')
  }
  const seen = new Set()
  const comics = raw.comics.map((comic) => normalizeComic(comic, seen)).filter(Boolean)
  return { comics }
}

export function findComic(catalog, comicSlug) {
  return catalog?.comics?.find((comic) => comic.slug === comicSlug) ?? null
}

export function findChapter(comic, chapterSlug) {
  return comic?.chapters?.find((chapter) => chapter.slug === chapterSlug) ?? null
}

// "page-5" -> 5. Anything else (page-0, page-x, 5, page-05) -> null.
export function parsePageSlug(pageSlug) {
  if (typeof pageSlug !== 'string') return null
  const match = /^page-([1-9]\d{0,5})$/.exec(pageSlug)
  return match ? Number(match[1]) : null
}

// Page numbers are 1-based positions in the chapter's pages list.
export function getPage(comic, chapterSlug, pageNum) {
  const chapter = findChapter(comic, chapterSlug)
  if (!chapter || !Number.isInteger(pageNum)) return null
  if (pageNum < 1 || pageNum > chapter.pages.length) return null
  return {
    path: chapter.pages[pageNum - 1],
    chapter,
    pageNum,
    totalPages: chapter.pages.length,
    title: `${chapter.title} - Page ${pageNum}`,
  }
}

export function readerPath(comicSlug, chapterSlug, pageNum) {
  return `/${comicSlug}/${chapterSlug}/page-${pageNum}`
}

// Neighbours of a page, crossing chapter boundaries and skipping chapters with no pages.
// Each of prev / next is { chapterSlug, pageNum } or null at the ends.
export function getPrevNext(comic, chapterSlug, pageNum) {
  if (!getPage(comic, chapterSlug, pageNum)) return { prev: null, next: null }
  const readable = comic.chapters.filter((chapter) => chapter.pages.length > 0)
  const chapterIndex = readable.findIndex((chapter) => chapter.slug === chapterSlug)
  const chapter = readable[chapterIndex]

  let prev = null
  if (pageNum > 1) {
    prev = { chapterSlug, pageNum: pageNum - 1 }
  } else if (chapterIndex > 0) {
    const before = readable[chapterIndex - 1]
    prev = { chapterSlug: before.slug, pageNum: before.pages.length }
  }

  let next = null
  if (pageNum < chapter.pages.length) {
    next = { chapterSlug, pageNum: pageNum + 1 }
  } else if (chapterIndex < readable.length - 1) {
    next = { chapterSlug: readable[chapterIndex + 1].slug, pageNum: 1 }
  }

  return { prev, next }
}

// Reader path of the first page of a chapter (or of the whole comic when chapterSlug is omitted).
// Returns null when there is nothing to read, including for coming-soon comics.
export function firstPagePath(comic, chapterSlug) {
  if (!comic || comic.status === 'coming-soon') return null
  const chapter = chapterSlug
    ? findChapter(comic, chapterSlug)
    : comic.chapters.find((candidate) => candidate.pages.length > 0)
  if (!chapter || chapter.pages.length === 0) return null
  return readerPath(comic.slug, chapter.slug, 1)
}
