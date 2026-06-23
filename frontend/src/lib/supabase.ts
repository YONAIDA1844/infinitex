import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

// Browser client — safe to use in React components (uses anon key)
// db.schema points all PostgREST queries to the 'test' schema where the tables live
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'test' },
})
