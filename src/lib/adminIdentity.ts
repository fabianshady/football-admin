/** Strict checks: an Auth account alone is not an administrator. */
export class AdminAccessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AdminAccessError'
  }
}

export function assertAuthenticated(user: { id: string } | null, hasError: boolean) {
  if (hasError || !user?.id) throw new AdminAccessError('Inicia sesión para continuar')
}
export function assertAdminRole(role: unknown) {
  if (role !== true) throw new AdminAccessError('Esta cuenta no tiene acceso de administrador')
}
