import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Service role key — privileged access, ONLY used server-side (Server Actions, Route Handlers)
// Never expose this in client components or browser-side code
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
