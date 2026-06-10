import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
}

// Browser client — safe to use in React components (uses publishable key)
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Server/admin client — uses secret key with full privileges.
// Import this ONLY from server-side or trusted backend code, never from browser components.
const supabaseSecretKey = (import.meta.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SECRET_KEY) as string

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
