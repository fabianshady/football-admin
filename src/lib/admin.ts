import 'server-only'
import { createClient } from '@/lib/supabase/server'

/** Every action verifies identity and role; the authenticated client also enforces RLS. */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Inicia sesión para continuar')
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw new Error(error.message)
  if (data !== true) throw new Error('Esta cuenta no tiene acceso de administrador')
  return supabase
}
