import { useNotifications } from '../hooks/useNotifications'

export default function SettingsPage() {
  const { permission, supported, enableNotifications, disableNotifications } = useNotifications()

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Definições</h1>
      </header>

      {/* Notifications */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Notificações semanais</h2>
          <p className="text-xs text-gray-400 mt-1">
            Recebe um lembrete todas as segundas-feiras para registar o teu mood.
          </p>
        </div>

        {!supported && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            O teu browser não suporta notificações push. Tenta instalar a app ou usar Chrome/Edge.
          </p>
        )}

        {supported && permission === 'denied' && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            As notificações estão bloqueadas nas definições do browser. Permite-as nas definições do site para activar.
          </p>
        )}

        {supported && permission !== 'denied' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {permission === 'granted' ? 'Activas' : 'Desactivadas'}
            </span>
            <button
              onClick={permission === 'granted' ? disableNotifications : enableNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                permission === 'granted' ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  permission === 'granted' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Privacy info */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Privacidade</h2>
        <ul className="space-y-2 text-xs text-gray-500">
          <li className="flex gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Não recolhemos qualquer dado pessoal identificável.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>O teu identificador de dispositivo é irreversivelmente anonimizado antes de ser guardado.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Os resultados apresentados são sempre agregados — nunca individuais.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Semanas com menos de 3 respostas não são apresentadas para proteger o anonimato.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>O token de notificações não está ligado à tua identidade.</span>
          </li>
        </ul>
      </div>

      {/* Install PWA hint */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Instalar a app</h2>
        <p className="text-xs text-gray-500">
          Podes instalar o Team Mood como uma app no teu dispositivo para acesso rápido, mesmo sem ligação à internet.
        </p>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li><strong className="text-gray-600">Android (Chrome):</strong> Menu ⋮ → "Adicionar ao ecrã inicial"</li>
          <li><strong className="text-gray-600">iPhone/iPad (Safari):</strong> Botão Partilhar → "Adicionar ao ecrã principal"</li>
          <li><strong className="text-gray-600">Desktop (Chrome/Edge):</strong> Ícone de instalação na barra de endereço</li>
        </ul>
      </div>
    </main>
  )
}
