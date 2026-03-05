import { useState } from 'react'

interface Props {
  onSubmit: (score: number) => Promise<void>
  disabled?: boolean
}

const EMOJI_MAP: Record<number, string> = {
  1: '😞', 2: '😟', 3: '😕', 4: '😐',
  5: '🙂', 6: '😊', 7: '😄', 8: '😁',
  9: '🤩', 10: '🥳',
}

const COLOR_MAP: Record<number, string> = {
  1: 'bg-red-500', 2: 'bg-red-400', 3: 'bg-orange-400', 4: 'bg-orange-300',
  5: 'bg-yellow-300', 6: 'bg-yellow-400', 7: 'bg-lime-400', 8: 'bg-green-400',
  9: 'bg-green-500', 10: 'bg-emerald-500',
}

export default function MoodPicker({ onSubmit, disabled }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selected) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(selected)
    } catch {
      setError('Erro ao guardar. Tenta novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Score buttons */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            disabled={disabled || submitting}
            onClick={() => setSelected(n)}
            className={`
              aspect-square rounded-xl text-lg font-bold transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${selected === n
                ? `${COLOR_MAP[n]} text-white scale-110 shadow-md`
                : 'bg-surface-subtle text-gray-600 hover:bg-gray-200 active:scale-95'
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Emoji feedback */}
      <div className="text-center h-12 flex items-center justify-center">
        {selected ? (
          <span className="text-5xl transition-all animate-bounce">
            {EMOJI_MAP[selected]}
          </span>
        ) : (
          <p className="text-sm text-gray-400">Selecciona um valor de 1 a 10</p>
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>Muito mal</span>
        <span>Excelente</span>
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selected || disabled || submitting}
        className="btn-primary w-full"
      >
        {submitting ? 'A guardar…' : 'Guardar mood'}
      </button>
    </div>
  )
}
