export const PAGE_SIZE = 1000
const MAX_PAGES = 100

type PageResult<T> = { data: T[] | null; error: { message: string } | null }

/** Fetches every row by ranges so PostgREST's row cap never truncates silently. */
export async function fetchAllPages<T>(page: (from: number, to: number) => PromiseLike<PageResult<T>>, size = PAGE_SIZE): Promise<T[]> {
  const rows: T[] = []
  for (let i = 0; i < MAX_PAGES; i++) {
    const { data, error } = await page(i * size, i * size + size - 1)
    if (error) throw new Error(error.message)
    const chunk = data ?? []
    rows.push(...chunk)
    if (chunk.length < size) return rows
  }
  throw new Error('Demasiados registros para cargar')
}
