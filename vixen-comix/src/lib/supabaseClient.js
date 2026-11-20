// The single Supabase browser client for the site.
// Only the project URL and the public anon key are read here. Without both,
// `supabase` is null and `authAvailable` is false: the site still works, and
// the sign-in pages say sign-in is unavailable.
//
// In development, VITE_USE_MOCK_SUPABASE=true swaps in an in-browser stand-in.
// `import.meta.env.DEV` is replaced by `false` in production builds, so the
// dynamic import below (and the mock file) never reaches dist/.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client = null

if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SUPABASE === 'true') {
  const { createMockSupabase } = await import('./mockSupabase.js')
  client = createMockSupabase()
} else if (url && anonKey) {
  try {
    client = createClient(url, anonKey, {
      auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true },
    })
  } catch (error) {
    console.error('Could not create the Supabase client. Sign-in is unavailable.', error)
  }
}

export const supabase = client
export const authAvailable = client !== null
