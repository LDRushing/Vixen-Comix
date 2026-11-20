import test from 'node:test'
import assert from 'node:assert/strict'
import { createMemoryStorage, createMockSupabase } from './mockSupabase.js'
import {
  buildContinueList,
  buildContinueStrip,
  loadReading,
  recordHistory,
  saveBookmark,
} from './readingData.js'
import { normalizeCatalog } from './comics.js'

const pages = (chapter, count) => Array.from({ length: count }, (_, i) => `/vale/${chapter}/page-${i + 1}.jpg`)

const catalog = normalizeCatalog({
  comics: [
    {
      slug: 'vale',
      title: 'The Vale',
      status: 'ongoing',
      cover: '/vale/cover.jpg',
      chapters: [
        { slug: 'prologue', title: 'Prologue', pages: pages('prologue', 3) },
        { slug: 'chapter-1', title: 'Chapter 1', pages: pages('chapter-1', 20) },
        { slug: 'chapter-2', title: 'Chapter 2', pages: pages('chapter-2', 6) },
      ],
    },
    {
      slug: 'other',
      title: 'Other',
      status: 'ongoing',
      chapters: [{ slug: 'chapter-1', title: 'Chapter 1', pages: ['/other/1.jpg', '/other/2.jpg'] }],
    },
    { slug: 'soon', title: 'Soon', status: 'coming-soon', chapters: [] },
  ],
})

// A fresh mock with two registered users. Returns helpers to switch between them.
async function setup() {
  const client = createMockSupabase({ storage: createMemoryStorage() })
  const ids = {}
  for (const name of ['ann', 'ben']) {
    const email = `${name}@example.com`
    const signedUp = await client.auth.signUp({ email, password: 'password123' })
    ids[name] = signedUp.data.user.id
  }
  const signInAs = async (name) => {
    const { error } = await client.auth.signInWithPassword({ email: `${name}@example.com`, password: 'password123' })
    assert.equal(error, null)
    return ids[name]
  }
  return { client, ids, signInAs }
}

test('sign-up needs confirmation: no session is returned', async () => {
  const client = createMockSupabase({ storage: createMemoryStorage() })
  const { data, error } = await client.auth.signUp({ email: 'a@example.com', password: 'password123' })
  assert.equal(error, null)
  assert.equal(data.session, null)
  assert.equal((await client.auth.getSession()).data.session, null)
})

test('saving a bookmark again replaces the spot (one per comic)', async () => {
  const { client, signInAs } = await setup()
  const ann = await signInAs('ann')
  await saveBookmark(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 5 })
  await saveBookmark(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-2', page: 2 })
  await saveBookmark(client, ann, { comicSlug: 'other', chapterSlug: 'chapter-1', page: 1 })
  const { bookmarks } = await loadReading(client, ann)
  assert.equal(bookmarks.length, 2)
  const vale = bookmarks.find((row) => row.comicSlug === 'vale')
  assert.equal(vale.chapterSlug, 'chapter-2')
  assert.equal(vale.page, 2)
})

test('history is one row per chapter and newest first', async () => {
  const { client, signInAs } = await setup()
  const ann = await signInAs('ann')
  await recordHistory(client, ann, { comicSlug: 'vale', chapterSlug: 'prologue', page: 1 })
  await recordHistory(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 6 })
  await recordHistory(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 7 })
  await recordHistory(client, ann, { comicSlug: 'other', chapterSlug: 'chapter-1', page: 2 })
  const { history } = await loadReading(client, ann)
  assert.equal(history.length, 3)
  assert.deepEqual(
    history.map((row) => `${row.comicSlug}/${row.chapterSlug}/${row.page}`),
    ['other/chapter-1/2', 'vale/chapter-1/7', 'vale/prologue/1'],
  )
  // Reading an older chapter again moves it to the top.
  await recordHistory(client, ann, { comicSlug: 'vale', chapterSlug: 'prologue', page: 2 })
  const again = await loadReading(client, ann)
  assert.equal(again.history[0].chapterSlug, 'prologue')
  assert.equal(again.history[0].page, 2)
})

test('two users are isolated from each other', async () => {
  const { client, signInAs } = await setup()
  const ann = await signInAs('ann')
  await saveBookmark(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 5 })
  await recordHistory(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 5 })

  const ben = await signInAs('ben')
  const benData = await loadReading(client, ben)
  assert.deepEqual(benData, { bookmarks: [], history: [] })
  // Ben asking for Ann's rows by id still sees nothing.
  const peek = await loadReading(client, ann)
  assert.deepEqual(peek, { bookmarks: [], history: [] })
  // Ben cannot write a row that belongs to Ann.
  await assert.rejects(saveBookmark(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 9 }), /row-level security/)

  const annAgain = await signInAs('ann')
  assert.equal((await loadReading(client, annAgain)).bookmarks[0].page, 5)
})

test('signed-out readers cannot read or write', async () => {
  const client = createMockSupabase({ storage: createMemoryStorage() })
  await assert.rejects(loadReading(client, 'nobody'), /permission denied/)
  await assert.rejects(saveBookmark(client, 'nobody', { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 1 }), /permission denied/)
})

test('bad spots are rejected before any request', async () => {
  const { client, signInAs } = await setup()
  const ann = await signInAs('ann')
  await assert.rejects(saveBookmark(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 0 }), /whole number/)
  await assert.rejects(saveBookmark(client, ann, { comicSlug: '', chapterSlug: 'chapter-1', page: 1 }), /required/)
  await assert.rejects(recordHistory(client, ann, { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 1.5 }), /whole number/)
})

test('buildContinueList drops stale slugs, missing pages and coming-soon comics', () => {
  const bookmarks = [
    { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 5, updatedAt: '2026-01-02T00:00:00.000Z' },
    { comicSlug: 'gone', chapterSlug: 'chapter-1', page: 1, updatedAt: '2026-01-03T00:00:00.000Z' },
    { comicSlug: 'soon', chapterSlug: 'chapter-1', page: 1, updatedAt: '2026-01-04T00:00:00.000Z' },
  ]
  const history = [
    { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 7, lastReadAt: '2026-01-05T00:00:00.000Z' },
    { comicSlug: 'vale', chapterSlug: 'renamed', page: 1, lastReadAt: '2026-01-06T00:00:00.000Z' },
    { comicSlug: 'vale', chapterSlug: 'chapter-2', page: 99, lastReadAt: '2026-01-07T00:00:00.000Z' },
    { comicSlug: 'other', chapterSlug: 'chapter-1', page: 2, lastReadAt: '2026-01-04T00:00:00.000Z' },
  ]
  const { saved, recent } = buildContinueList(catalog, bookmarks, history)
  assert.equal(saved.length, 1)
  assert.equal(saved[0].label, 'Chapter 1, page 5')
  assert.equal(saved[0].path, '/vale/chapter-1/page-5')
  assert.equal(saved[0].comicTitle, 'The Vale')
  assert.deepEqual(
    recent.map((spot) => spot.path),
    ['/vale/chapter-1/page-7', '/other/chapter-1/page-2'],
  )
})

test('recently read keeps at most 10 entries, newest first', () => {
  const manyCatalog = normalizeCatalog({
    comics: [
      {
        slug: 'big',
        title: 'Big',
        status: 'ongoing',
        chapters: Array.from({ length: 15 }, (_, i) => ({ slug: `c${i + 1}`, title: `C${i + 1}`, pages: ['/a.jpg'] })),
      },
    ],
  })
  const history = Array.from({ length: 15 }, (_, i) => ({
    comicSlug: 'big',
    chapterSlug: `c${i + 1}`,
    page: 1,
    lastReadAt: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
  }))
  const { recent } = buildContinueList(manyCatalog, [], history)
  assert.equal(recent.length, 10)
  assert.equal(recent[0].chapterSlug, 'c15')
})

test('buildContinueStrip shows saved spots first, then other comics, once per comic', () => {
  const list = buildContinueList(
    catalog,
    [{ comicSlug: 'vale', chapterSlug: 'chapter-1', page: 5, updatedAt: '2026-01-02T00:00:00.000Z' }],
    [
      { comicSlug: 'vale', chapterSlug: 'chapter-1', page: 7, lastReadAt: '2026-01-05T00:00:00.000Z' },
      { comicSlug: 'other', chapterSlug: 'chapter-1', page: 2, lastReadAt: '2026-01-04T00:00:00.000Z' },
    ],
  )
  const strip = buildContinueStrip(list, 3)
  assert.deepEqual(
    strip.map((spot) => spot.path),
    ['/vale/chapter-1/page-5', '/other/chapter-1/page-2'],
  )
  assert.deepEqual(buildContinueStrip({ saved: [], recent: [] }), [])
})
