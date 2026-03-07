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

  const handleSave = () => {
    startTransition(async () => {
      await updateMatchScore(matchId, scoreHome, scoreAway)
      setIsEditing(false)
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
            min="0"
            value={scoreHome}
            onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
            className="w-10 h-9 text-center border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isPending}
          />
          <span className="text-slate-400 font-bold text-xs">—</span>
          <input
            type="number"
            min="0"
            value={scoreAway}
            onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
            className="w-10 h-9 text-center border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isPending}
          />
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg disabled:opacity-50 transition"
          >
            {isPending ? '…' : '✓ OK'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-[10px] font-bold bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`px-4 py-2 rounded-xl font-mono font-black text-xl cursor-pointer hover:ring-2 hover:ring-blue-400/50 hover:scale-105 transition-all ${
        isWin
          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
          : isLoss
          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
      }`}
      title="Clic para editar marcador"
    >
      {initialHome}–{initialAway}
    </button>
  )
}
