/** Strict checks: an Auth account alone is not an administrator. */
export function assertAuthenticated(user: { id: string } | null, hasError: boolean) {
  if (hasError || !user?.id) throw new Error('Inicia sesión para continuar')
}
export function assertAdminRole(role: unknown) {
  if (role !== true) throw new Error('Esta cuenta no tiene acceso de administrador')
}
