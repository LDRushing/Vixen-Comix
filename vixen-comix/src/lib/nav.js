// Safe "where to go after login" paths.
// No React and no import.meta here so `node --test` can load this file.

export const DEFAULT_NEXT_PATH = '/continue-reading'
const MAX_LENGTH = 500

// Accepts only same-site paths such as "/vale-of-wales/chapter-1/page-5".
// Anything else (other sites, "//host", "javascript:", backslashes, control
// characters, non-text values) becomes the default path.
export function safeNextPath(value) {
  if (typeof value !== 'string' || value.length > MAX_LENGTH) return DEFAULT_NEXT_PATH
  if (!/^\/(?!\/)/.test(value)) return DEFAULT_NEXT_PATH
  if (value.includes('\\')) return DEFAULT_NEXT_PATH
  // Browsers drop tabs and newlines inside URLs, so "/\t/evil.example" would become "//evil.example".
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code <= 0x20 || code === 0x7f) return DEFAULT_NEXT_PATH
  }
  return value
}
