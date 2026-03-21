import { useState } from 'react'

const steps = [
  {
    icon: '🍅',
    title: 'Avvia il Pomodoro',
    desc: 'Scegli l\'argomento e la durata. Il timer parte e studi in focus totale.',
    color: 'red',
    detail: 'La tecnica Pomodoro divide lo studio in sessioni concentrate. Niente distrazioni, solo focus.'
  },
  {
    icon: '🎙️',
    title: 'Spiega a voce',
    desc: 'Finito il timer, registra una spiegazione di tutto quello che ricordi.',
    color: 'orange',
    detail: 'La tecnica Feynman: spiegare un concetto ad alta voce è il modo migliore per capire cosa sai davvero.'
  },
  {
    icon: '🧠',
    title: 'Analisi AI',
    desc: 'L\'AI trascrive e analizza la tua spiegazione. Trova lacune e punti di forza.',
    color: 'yellow',
    detail: 'Whisper trascrive il tuo audio, LLaMA 70B analizza il contenuto e identifica cosa manca.'
  },
  {
    icon: '🤖',
    title: 'Interrogazione socratica',
    desc: 'L\'AI ti fa domande mirate sulle lacune. Rispondi a voce o per testo.',
    color: 'blue',
    detail: 'Il metodo socratico usa domande per stimolare il pensiero critico. L\'AI non spiega mai — fa solo domande.'
  },
  {
    icon: '☕',
    title: 'Pausa meritata',
    desc: 'Sessione salvata. Il timer di pausa parte automaticamente.',
    color: 'green',
    detail: 'Il riposo è parte del processo di apprendimento. Il cervello consolida i ricordi durante le pause.'
  },
]

const colorMap = {
  red:    { bg: 'bg-red-500/15',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-500',    line: 'bg-red-500/30' },
  orange: { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500', line: 'bg-orange-500/30' },
  yellow: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500', line: 'bg-yellow-500/30' },
  blue:   { bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-400',   dot: 'bg-blue-500',   line: 'bg-blue-500/30' },
  green:  { bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',text: 'text-emerald-400',dot: 'bg-emerald-500',line: 'bg-emerald-500/30' },
}

export default function HowItWorks() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)

  return (
    <>
      {/* Pulsante fisso bottom-right */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/15 transition-all duration-200 shadow-lg">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 8v5M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {/* Fumetto */}
          <div className="absolute bottom-14 right-0 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-xl">
            Come funziona? ✨
            <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-[#1a1a2e] border-r border-b border-white/10 rotate-45" />
          </div>
        </div>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar destra */}
      <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-[#0f0f1a]/98 backdrop-blur-xl border-l border-white/8 flex flex-col">

          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg" style={{fontFamily:'Georgia, serif'}}>Come funziona</h3>
                <p className="text-gray-500 text-xs mt-1">Il tuo ciclo di studio AI</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Flow */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2">

            {/* Flusso grafico */}
            <div className="relative">
              {steps.map((step, i) => {
                const c = colorMap[step.color]
                const isActive = active === i
                return (
                  <div key={i} className="relative">
                    {/* Linea connettore */}
                    {i < steps.length - 1 && (
                      <div className={`absolute left-5 top-12 w-0.5 h-6 ${c.line} z-0`} />
                    )}

                    {/* Step card */}
                    <button
                      onClick={() => setActive(isActive ? null : i)}
                      className={`relative z-10 w-full flex items-start gap-4 p-3 rounded-2xl border transition-all duration-200 mb-2 text-left ${
                        isActive ? `${c.bg} ${c.border}` : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {/* Icon circle */}
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl ${isActive ? c.bg : 'bg-white/5'} border ${isActive ? c.border : 'border-white/10'}`}>
                        {step.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isActive ? c.text : 'text-gray-600'}`}>0{i+1}</span>
                          <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{step.title}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">{step.desc}</p>

                        {/* Dettaglio espandibile */}
                        {isActive && (
                          <div className={`mt-3 p-3 rounded-xl ${c.bg} border ${c.border}`}>
                            <p className={`text-xs leading-relaxed ${c.text}`}>{step.detail}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Stack tecnologico */}
            <div className="mt-6 p-4 bg-white/[0.02] border border-white/8 rounded-2xl">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Stack tecnologico</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Whisper', desc: 'Trascrizione', icon: '🎙️' },
                  { name: 'LLaMA 70B', desc: 'AI socratica', icon: '🤖' },
                  { name: 'Supabase', desc: 'Database', icon: '🗄️' },
                  { name: 'FastAPI', desc: 'Backend', icon: '⚡' },
                ].map(t => (
                  <div key={t.name} className="bg-white/5 border border-white/8 rounded-xl p-2.5 text-center">
                    <div className="text-lg mb-1">{t.icon}</div>
                    <div className="text-white text-xs font-semibold">{t.name}</div>
                    <div className="text-gray-600 text-xs">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
