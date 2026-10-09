export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

/** Expected validation/DB errors must survive Next's production error sanitization. */
export async function actionResult<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try { return { ok: true, data: await action() } }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'No se pudo guardar. Intenta de nuevo.' } }
}
export function unwrapResult<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error)
  return result.data
}
