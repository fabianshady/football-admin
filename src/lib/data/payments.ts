import 'server-only'
import { cache } from 'react'
import { requireAdmin } from '@/lib/admin'
import { queryPaymentMatrix } from '@/lib/pure/adminQueries'

const matrixFor = cache(async (seasonId: string | null) => queryPaymentMatrix(await requireAdmin(), seasonId))

export const getPaymentMatrix = (seasonId?: string | null) => matrixFor(seasonId ?? null)

export type PaymentMatrix = Awaited<ReturnType<typeof getPaymentMatrix>>
