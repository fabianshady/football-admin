'use client'

import { useState, useTransition } from 'react'
import { updateMatchScore } from '@/app/actions/matches'

type Props = {
  matchId: string
  initialHome: number
  initialAway: number
  isWin: boolean
  isLoss: boolean
}

export default function ScoreEditor({ matchId, initialHome, initialAway, isWin, isLoss }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [scoreHome, setScoreHome] = useState(initialHome)
  const [scoreAway, setScoreAway] = useState(initialAway)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSave = () => {
    startTransition(async () => {
      setError('')
      try {
        await updateMatchScore(matchId, scoreHome, scoreAway)
        setIsEditing(false)
      } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo guardar el marcador') }
    })
  }

  const handleCancel = () => {
    setScoreHome(initialHome)
    setScoreAway(initialAway)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            aria-label="Goles de nosotros"
            min="0"
            value={scoreHome}
            onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
            className="field-input h-9 w-10 px-0 text-center font-bold"
            disabled={isPending}
          />
          <span className="text-xs font-bold text-muted-foreground">—</span>
          <input
            type="number"
            aria-label="Goles del rival"
            min="0"
            value={scoreAway}
            onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
            className="field-input h-9 w-10 px-0 text-center font-bold"
            disabled={isPending}
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isPending ? '…' : '✓ OK'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-bold text-foreground transition hover:bg-muted/80"
          >
            ✕
          </button>
        </div>
        {error && <p role="alert" className="text-xs text-banner">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        setScoreHome(initialHome)
        setScoreAway(initialAway)
        setError('')
        setIsEditing(true)
      }}
      className={`cursor-pointer rounded-xl px-4 py-2 font-display text-xl font-bold tabular-nums transition-all hover:scale-105 hover:ring-2 hover:ring-gold/50 ${
        isWin
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : isLoss
          ? 'bg-banner/15 text-banner'
          : 'bg-gold/15 text-gold'
      }`}
      title="Clic para editar marcador"
    >
      {initialHome}–{initialAway}
    </button>
  )
}
