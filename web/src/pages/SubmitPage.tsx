import { useMood } from '../hooks/useMood'
import { formatWeekKey } from '../hooks/useWeekKey'
import MoodPicker from '../components/MoodPicker'

const EMOJI_MAP: Record<number, string> = {
  1: '😞', 2: '😟', 3: '😕', 4: '😐',
  5: '🙂', 6: '😊', 7: '😄', 8: '😁',
  9: '🤩', 10: '🥳',
}

export default function SubmitPage() {
  const { status, weekKey, submitMood } = useMood()

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <header className="mb-8">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-widest mb-1">
          {formatWeekKey(weekKey)}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Como te sentes?</h1>
        <p className="text-sm text-gray-500 mt-1">
          A tua resposta é anónima e contribui para o bem-estar da equipa.
        </p>
      </header>

      <div className="card">
        {status.state === 'loading' && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        )}

        {status.state === 'pending' && (
          <MoodPicker onSubmit={submitMood} />
        )}

        {status.state === 'submitted' && (
          <div className="text-center py-8 space-y-3">
            <div className="text-6xl">{EMOJI_MAP[status.score]}</div>
            <h2 className="text-xl font-bold text-gray-900">Obrigado!</h2>
            <p className="text-gray-500 text-sm">
              Registaste <span className="font-semibold text-brand-600">{status.score}/10</span> esta semana.
            </p>
            <p className="text-xs text-gray-400 pt-2">
              Volta na próxima semana para registar o teu mood.
            </p>
          </div>
        )}

        {status.state === 'error' && (
          <div className="text-center py-8 space-y-3">
            <p className="text-red-500">{status.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
