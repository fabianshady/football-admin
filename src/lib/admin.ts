import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { assertAuthenticated, assertAdminRole } from './adminIdentity'

/** Every action verifies identity and role; the authenticated client also enforces RLS. */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  assertAuthenticated(user, Boolean(authError))
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw new Error(error.message)
  assertAdminRole(data)
  return supabase
}
