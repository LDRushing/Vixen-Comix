// Development-only stand-in for the Supabase browser client.
// It implements only what this app calls: auth.getSession, onAuthStateChange,
// signUp, signInWithPassword, signInWithOAuth, signOut, resetPasswordForEmail,
// updateUser, and from(table).select / upsert / eq / order / limit.
//
// Data lives in localStorage under "vc.mock.*" (or in memory when a storage
// object is passed in, as the unit tests do). Rows are scoped to the signed-in
// mock user, the way row level security scopes them on the real database.
// No React and no import.meta here so `node --test` can load this file.

const PREFIX = 'vc.mock.'
const TIMESTAMP_COLUMN = { bookmarks: 'updated_at', reading_history: 'last_read_at' }
const MOCK_GOOGLE_EMAIL = 'google.reader@example.com'

export function createMemoryStorage() {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value))
    },
    removeItem: (key) => {
      map.delete(key)
    },
  }
}

function defaultStorage() {
  try {
    if (globalThis.localStorage) return globalThis.localStorage
  } catch {
    // Storage can be blocked by browser privacy settings.
  }
  return createMemoryStorage()
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `mock-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function authError(message) {
  return { message, status: 400 }
}

export function createMockSupabase({ storage } = {}) {
  const store = storage ?? defaultStorage()
  const listeners = new Set()
  let lastTimestamp = 0

  function read(name, fallback) {
    try {
      const raw = store.getItem(PREFIX + name)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  }

  function write(name, value) {
    store.setItem(PREFIX + name, JSON.stringify(value))
  }

  // Strictly increasing so "newest first" is stable even within one millisecond.
  function nowIso() {
    lastTimestamp = Math.max(Date.now(), lastTimestamp + 1)
    return new Date(lastTimestamp).toISOString()
  }

  function currentUser() {
    const id = read('session', null)
    if (!id) return null
    const user = read('users', []).find((candidate) => candidate.id === id)
    return user ? { id: user.id, email: user.email } : null
  }

  function currentSession() {
    const user = currentUser()
    return user ? { access_token: 'mock-access-token', user } : null
  }

  function emit(event) {
    const session = currentSession()
    for (const listener of [...listeners]) listener(event, session)
  }

  function startSession(user, event = 'SIGNED_IN') {
    write('session', user.id)
    emit(event)
    return { user: { id: user.id, email: user.email }, session: currentSession() }
  }

  function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : ''
  }

  const auth = {
    async getSession() {
      return { data: { session: currentSession() }, error: null }
    },

    onAuthStateChange(callback) {
      listeners.add(callback)
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } }
    },

    // The mock user is created but no session is returned: this mirrors a
    // project with "Confirm email" switched on, where the reader must confirm first.
    async signUp({ email, password } = {}) {
      const cleanEmail = normalizeEmail(email)
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { data: { user: null, session: null }, error: authError('Enter a valid email address.') }
      }
      if (typeof password !== 'string' || password.length < 6) {
        return { data: { user: null, session: null }, error: authError('Password should be at least 6 characters.') }
      }
      const users = read('users', [])
      let user = users.find((candidate) => candidate.email === cleanEmail)
      if (!user) {
        user = { id: randomId(), email: cleanEmail, password }
        write('users', [...users, user])
      }
      return { data: { user: { id: user.id, email: user.email }, session: null }, error: null }
    },

    async signInWithPassword({ email, password } = {}) {
      const user = read('users', []).find((candidate) => candidate.email === normalizeEmail(email))
      if (!user || user.password !== password) {
        return { data: { user: null, session: null }, error: authError('Invalid login credentials') }
      }
      return { data: startSession(user), error: null }
    },

    // The real call leaves the site for Google. The mock signs in a fixed mock Google user.
    async signInWithOAuth({ provider } = {}) {
      if (provider !== 'google') {
        return { data: { provider, url: null }, error: authError('Unsupported provider') }
      }
      const users = read('users', [])
      let user = users.find((candidate) => candidate.email === MOCK_GOOGLE_EMAIL)
      if (!user) {
        user = { id: randomId(), email: MOCK_GOOGLE_EMAIL, password: null }
        write('users', [...users, user])
      }
      startSession(user)
      return { data: { provider, url: null }, error: null }
    },

    async signOut() {
      store.removeItem(PREFIX + 'session')
      emit('SIGNED_OUT')
      return { error: null }
    },

    async resetPasswordForEmail(email) {
      if (!normalizeEmail(email).includes('@')) return { data: null, error: authError('Enter a valid email address.') }
      return { data: {}, error: null }
    },

    async updateUser({ password } = {}) {
      const user = currentUser()
      if (!user) return { data: { user: null }, error: authError('Auth session missing!') }
      if (typeof password !== 'string' || password.length < 6) {
        return { data: { user: null }, error: authError('Password should be at least 6 characters.') }
      }
      write(
        'users',
        read('users', []).map((candidate) => (candidate.id === user.id ? { ...candidate, password } : candidate)),
      )
      emit('USER_UPDATED')
      return { data: { user }, error: null }
    },
  }

  class Query {
    constructor(table) {
      this.table = table
      this.op = 'select'
      this.filters = []
      this.sort = null
      this.max = null
      this.payload = null
      this.conflictColumns = null
    }

    select() {
      return this
    }

    upsert(payload, { onConflict } = {}) {
      this.op = 'upsert'
      this.payload = payload
      this.conflictColumns = typeof onConflict === 'string' ? onConflict.split(',').map((name) => name.trim()) : null
      return this
    }

    eq(column, value) {
      this.filters.push([column, value])
      return this
    }

    order(column, { ascending = true } = {}) {
      this.sort = { column, ascending }
      return this
    }

    limit(count) {
      this.max = count
      return this
    }

    then(resolve, reject) {
      return Promise.resolve()
        .then(() => this.run())
        .then(resolve, reject)
    }

    run() {
      if (!(this.table in TIMESTAMP_COLUMN)) {
        return { data: null, error: { message: `relation "public.${this.table}" does not exist` } }
      }
      const user = currentUser()
      if (!user) return { data: null, error: { message: 'permission denied for table ' + this.table } }
      return this.op === 'upsert' ? this.runUpsert(user) : this.runSelect(user)
    }

    runSelect(user) {
      let rows = read('rows.' + this.table, []).filter((row) => row.user_id === user.id)
      for (const [column, value] of this.filters) rows = rows.filter((row) => row[column] === value)
      if (this.sort) {
        const { column, ascending } = this.sort
        rows = [...rows].sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0))
        if (!ascending) rows.reverse()
      }
      if (typeof this.max === 'number') rows = rows.slice(0, this.max)
      return { data: JSON.parse(JSON.stringify(rows)), error: null }
    }

    runUpsert(user) {
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload]
      const stamp = TIMESTAMP_COLUMN[this.table]
      const keyColumns = this.conflictColumns ?? ['user_id', 'comic_slug']
      const rows = read('rows.' + this.table, [])
      for (const item of incoming) {
        const row = { ...item, user_id: item.user_id ?? user.id }
        // Row level security: a reader can only write rows that belong to them.
        if (row.user_id !== user.id) {
          return { data: null, error: { message: `new row violates row-level security policy for table "${this.table}"` } }
        }
        if (typeof row.comic_slug !== 'string' || !row.comic_slug || typeof row.chapter_slug !== 'string' || !row.chapter_slug) {
          return { data: null, error: { message: 'comic_slug and chapter_slug are required' } }
        }
        if (!Number.isInteger(row.page) || row.page < 1) {
          return { data: null, error: { message: 'new row violates check constraint (page >= 1)' } }
        }
        const index = rows.findIndex((existing) => keyColumns.every((column) => existing[column] === row[column]))
        const saved = { ...row, [stamp]: nowIso() }
        if (index >= 0) rows[index] = saved
        else rows.push(saved)
      }
      write('rows.' + this.table, rows)
      return { data: null, error: null }
    }
  }

  return {
    auth,
    from(table) {
      return new Query(table)
    },
  }
}
