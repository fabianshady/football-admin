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
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            value={scoreHome}
            onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
            className="w-10 h-8 text-center border dark:border-gray-600 rounded text-sm font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isPending}
          />
          <span className="text-gray-400 font-bold">-</span>
          <input
            type="number"
            min="0"
            value={scoreAway}
            onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
            className="w-10 h-8 text-center border dark:border-gray-600 rounded text-sm font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isPending}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isPending ? '...' : '✓'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-[10px] bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
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
      className={`px-3 py-1 rounded-lg font-mono font-bold text-lg sm:text-xl cursor-pointer hover:ring-2 hover:ring-blue-300 transition ${
        isWin ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
        isLoss ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
      }`}
      title="Clic para editar marcador"
    >
      {initialHome} - {initialAway}
    </button>
  )
}
