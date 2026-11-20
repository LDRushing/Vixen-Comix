import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  findChapter,
  findComic,
  firstPagePath,
  getPage,
  getPrevNext,
  normalizeCatalog,
  parsePageSlug,
  readerPath,
} from './comics.js'

const raw = JSON.parse(readFileSync(new URL('../../public/comics.json', import.meta.url), 'utf8'))
const catalog = normalizeCatalog(raw)
const vale = findComic(catalog, 'vale-of-wales')

function quietly(fn) {
  const original = console.warn
  const warnings = []
  console.warn = (message) => warnings.push(message)
  try {
    return { result: fn(), warnings }
  } finally {
    console.warn = original
  }
}

test('the real comics.json loads with three comics and no warnings', () => {
  const { result, warnings } = quietly(() => normalizeCatalog(raw))
  assert.deepEqual(
    result.comics.map((comic) => comic.slug),
    ['vale-of-wales', 'le-monstre-social', 'the-war-dolls'],
  )
  assert.deepEqual(warnings, [])
})

test('normalizeCatalog drops bad entries and warns', () => {
  const { result, warnings } = quietly(() =>
    normalizeCatalog({
      comics: [
        { slug: 'good', title: 'Good', status: 'ongoing', chapters: [
          { slug: 'c1', title: 'C1', pages: ['/a.jpg', 42, '/b.jpg'] },
          { slug: 'c1', title: 'Duplicate', pages: ['/x.jpg'] },
          { title: 'No slug', pages: [] },
          'not an object',
        ] },
        { slug: 'good', title: 'Duplicate comic', status: 'ongoing' },
        { title: 'No slug', status: 'ongoing' },
        { slug: 'bad status', title: 'Bad', status: 'ongoing' },
        { slug: 'weird', title: 'Weird', status: 'paused' },
        null,
      ],
    }),
  )
  assert.equal(result.comics.length, 1)
  const [comic] = result.comics
  assert.equal(comic.slug, 'good')
  assert.equal(comic.chapters.length, 1)
  assert.deepEqual(comic.chapters[0].pages, ['/a.jpg', '/b.jpg'])
  assert.ok(warnings.length >= 6)
})

test('normalizeCatalog throws on a file that is not a catalog', () => {
  assert.throws(() => normalizeCatalog(null))
  assert.throws(() => normalizeCatalog({ comics: 'nope' }))
  assert.throws(() => normalizeCatalog([]))
})

test('normalizeCatalog only keeps http(s) external links', () => {
  const { result } = quietly(() =>
    normalizeCatalog({
      comics: [
        { slug: 'a', status: 'ongoing', externalUrl: 'javascript:alert(1)' },
        { slug: 'b', status: 'ongoing', externalUrl: 'https://example.com' },
      ],
    }),
  )
  assert.equal(result.comics[0].externalUrl, undefined)
  assert.equal(result.comics[1].externalUrl, 'https://example.com')
})

test('Vale of Wales has the expected chapters and page counts', () => {
  assert.equal(findChapter(vale, 'prologue').pages.length, 7)
  assert.equal(findChapter(vale, 'chapter-1').pages.length, 20)
  assert.equal(findChapter(vale, 'chapter-2').pages.length, 6)
  assert.equal(findChapter(vale, 'chapter-3').pages.length, 0)
  assert.equal(findChapter(vale, 'epilogue').pages.length, 0)
  assert.equal(vale.chapters.length, 32)
})

test('getPage respects bounds and unknown chapters', () => {
  assert.equal(getPage(vale, 'chapter-1', 1).path, '/vale-of-wales/chapter-1/page-1.jpg')
  assert.equal(getPage(vale, 'chapter-1', 5).title, 'Chapter 1 - Page 5')
  assert.equal(getPage(vale, 'chapter-1', 20).path, '/vale-of-wales/chapter-1/page-20.jpg')
  assert.equal(getPage(vale, 'chapter-1', 21), null)
  assert.equal(getPage(vale, 'chapter-1', 0), null)
  assert.equal(getPage(vale, 'chapter-1', 1.5), null)
  assert.equal(getPage(vale, 'chapter-13', 5), null)
  assert.equal(getPage(vale, 'chapter-3', 1), null)
  assert.equal(getPage(vale, 'prologue', 1).path, '/vale-of-wales/prologue/page-0.jpg')
  assert.equal(getPage(vale, 'chapter-2', 6).path, '/vale-of-wales/chapter 2/ch 2 pg 5.jpg')
})

test('parsePageSlug accepts page-N and rejects everything else', () => {
  assert.equal(parsePageSlug('page-5'), 5)
  assert.equal(parsePageSlug('page-20'), 20)
  assert.equal(parsePageSlug('page-0'), null)
  assert.equal(parsePageSlug('page-x'), null)
  assert.equal(parsePageSlug('page--1'), null)
  assert.equal(parsePageSlug('page-05'), null)
  assert.equal(parsePageSlug('5'), null)
  assert.equal(parsePageSlug(undefined), null)
})

test('readerPath builds the reader URL', () => {
  assert.equal(readerPath('vale-of-wales', 'chapter-1', 5), '/vale-of-wales/chapter-1/page-5')
})

test('getPrevNext crosses from the prologue into chapter 1 and back', () => {
  assert.deepEqual(getPrevNext(vale, 'prologue', 7).next, { chapterSlug: 'chapter-1', pageNum: 1 })
  assert.deepEqual(getPrevNext(vale, 'chapter-1', 1).prev, { chapterSlug: 'prologue', pageNum: 7 })
  assert.deepEqual(getPrevNext(vale, 'chapter-1', 5), {
    prev: { chapterSlug: 'chapter-1', pageNum: 4 },
    next: { chapterSlug: 'chapter-1', pageNum: 6 },
  })
})

test('getPrevNext: first page has no prev, end of chapter 2 has no next', () => {
  assert.equal(getPrevNext(vale, 'prologue', 1).prev, null)
  assert.deepEqual(getPrevNext(vale, 'chapter-1', 20).next, { chapterSlug: 'chapter-2', pageNum: 1 })
  assert.equal(getPrevNext(vale, 'chapter-2', 6).next, null)
  assert.deepEqual(getPrevNext(vale, 'chapter-2', 6).prev, { chapterSlug: 'chapter-2', pageNum: 5 })
})

test('getPrevNext skips chapters that have no pages', () => {
  const comic = {
    slug: 'x',
    status: 'ongoing',
    chapters: [
      { slug: 'one', title: 'One', pages: ['/1.jpg'] },
      { slug: 'two', title: 'Two', pages: [] },
      { slug: 'three', title: 'Three', pages: ['/3a.jpg', '/3b.jpg'] },
    ],
  }
  assert.deepEqual(getPrevNext(comic, 'one', 1).next, { chapterSlug: 'three', pageNum: 1 })
  assert.deepEqual(getPrevNext(comic, 'three', 1).prev, { chapterSlug: 'one', pageNum: 1 })
  assert.deepEqual(getPrevNext(comic, 'two', 1), { prev: null, next: null })
})

test('coming-soon comics have no first page; ongoing comics start at the prologue', () => {
  assert.equal(firstPagePath(findComic(catalog, 'le-monstre-social')), null)
  assert.equal(firstPagePath(findComic(catalog, 'the-war-dolls')), null)
  assert.equal(firstPagePath(vale), '/vale-of-wales/prologue/page-1')
  assert.equal(firstPagePath(vale, 'chapter-2'), '/vale-of-wales/chapter-2/page-1')
  assert.equal(firstPagePath(vale, 'chapter-3'), null)
  assert.equal(firstPagePath(vale, 'nope'), null)
})

test('findComic returns null for unknown slugs', () => {
  assert.equal(findComic(catalog, 'nope'), null)
  assert.equal(findComic(null, 'vale-of-wales'), null)
})
