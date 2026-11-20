import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_NEXT_PATH, safeNextPath } from './nav.js'

test('safeNextPath keeps same-site paths', () => {
  assert.equal(safeNextPath('/vale-of-wales/chapter-1/page-5'), '/vale-of-wales/chapter-1/page-5')
  assert.equal(safeNextPath('/continue-reading'), '/continue-reading')
  assert.equal(safeNextPath('/comics?x=1#top'), '/comics?x=1#top')
  assert.equal(safeNextPath('/'), '/')
})

test('safeNextPath falls back to /continue-reading for anything else', () => {
  assert.equal(DEFAULT_NEXT_PATH, '/continue-reading')
  const bad = [
    'https://evil.example',
    'http://evil.example/x',
    '//evil.example',
    '///evil.example',
    '/\\evil.example',
    '\\\\evil.example',
    'javascript:alert(1)',
    'data:text/html,hi',
    'vale-of-wales/chapter-1/page-5',
    '',
    ' /comics',
    '/\t/evil.example',
    '/\n/evil.example',
    '/a b',
    '/' + 'a'.repeat(600),
    null,
    undefined,
    42,
    {},
    ['/comics'],
  ]
  for (const value of bad) {
    assert.equal(safeNextPath(value), DEFAULT_NEXT_PATH, `should reject ${JSON.stringify(value)}`)
  }
})
