import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { assertAuthenticated, assertAdminRole } from './adminIdentity'

/** Deduplicated within one server render/action only. Never cache sessions across requests. */
export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  assertAuthenticated(user, Boolean(authError))
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw new Error(error.message)
  assertAdminRole(data)
  return supabase
})
