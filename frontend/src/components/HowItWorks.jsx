import { useState } from 'react'

const steps = [
  { icon: '🍅', title: 'Avvia il Pomodoro', desc: 'Scegli argomento e durata. Studia in focus totale.', color: '#ef4444', detail: 'La tecnica Pomodoro divide lo studio in sessioni concentrate. Niente distrazioni.' },
  { icon: '🎙️', title: 'Spiega a voce', desc: 'Registra tutto quello che ricordi sull\'argomento.', color: '#f97316', detail: 'Tecnica Feynman: spiegare ad alta voce rivela cosa sai davvero.' },
  { icon: '🧠', title: 'Analisi AI', desc: 'Whisper trascrive. LLaMA trova lacune e punti di forza.', color: '#eab308', detail: 'L\'AI analizza il contenuto e identifica i concetti mancanti.' },
  { icon: '🤖', title: 'Interrogazione socratica', desc: 'Domande mirate sulle tue lacune. Voce o testo.', color: '#3b82f6', detail: 'Il metodo socratico usa domande per stimolare il pensiero critico.' },
  { icon: '☕', title: 'Pausa meritata', desc: 'Sessione salvata. Timer pausa parte automaticamente.', color: '#10b981', detail: 'Il riposo consolida i ricordi. Parte del processo di apprendimento.' },
]

const tech = [
  { name: 'Whisper', desc: 'Trascrizione vocale', icon: '🎙️', color: '#f97316' },
  { name: 'LLaMA 70B', desc: 'AI socratica', icon: '🤖', color: '#3b82f6' },
  { name: 'Supabase', desc: 'Database & Auth', icon: '🗄️', color: '#10b981' },
  { name: 'FastAPI', desc: 'Backend API', icon: '⚡', color: '#eab308' },
  { name: 'React', desc: 'Frontend', icon: '⚛️', color: '#60a5fa' },
  { name: 'Groq', desc: 'Inference veloce', icon: '🚀', color: '#a855f7' },
]

export default function HowItWorks() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [showBubble, setShowBubble] = useState(true)

  return (
    <>
      {/* Pulsante fisso bottom-right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">

        {/* Fumetto */}
        {showBubble && !open && (
          <div className="flex items-center gap-2 bg-[#1a1a2e]/95 border border-white/10 rounded-2xl px-4 py-2.5 shadow-xl backdrop-blur-sm animate-bounce">
            <span className="text-sm">✨</span>
            <span className="text-white text-xs font-medium">Come funziona?</span>
            <button onClick={() => setShowBubble(false)} className="text-gray-600 hover:text-gray-400 text-xs ml-1">✕</button>
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-[#1a1a2e] border-r border-b border-white/10 rotate-45" />
          </div>
        )}

        <button
          onClick={() => { setOpen(true); setShowBubble(false) }}
          className="w-12 h-12 rounded-full bg-white/8 border border-white/15 backdrop-blur-sm flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/15 transition-all duration-200 shadow-lg hover:scale-110"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 8v5M9 5.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {open && <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-[#0d0d1a]/98 backdrop-blur-xl border-l border-white/8 flex flex-col">

          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold" style={{fontFamily:'Georgia, serif'}}>Come funziona ✨</h3>
              <p className="text-gray-600 text-xs mt-0.5">Il ciclo di studio AI potenziato</p>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition text-sm">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* Flow verticale */}
            <div className="relative">
              {/* Linea verticale continua */}
              <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gradient-to-b from-red-500/50 via-blue-500/50 to-emerald-500/50" />

              <div className="space-y-1">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(active === i ? null : i)}
                    className="relative w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-left"
                  >
                    {/* Dot colorato sulla linea */}
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg z-10 border"
                      style={{
                        background: `${step.color}20`,
                        borderColor: `${step.color}40`,
                      }}
                    >
                      {step.icon}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{color: step.color}}>0{i+1}</span>
                        <span className="text-white text-sm font-semibold">{step.title}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                      {active === i && (
                        <div className="mt-2 p-2.5 rounded-lg text-xs leading-relaxed" style={{background: `${step.color}15`, color: step.color, border: `1px solid ${step.color}30`}}>
                          {step.detail}
                        </div>
                      )}
                    </div>

                    <span className="text-gray-700 text-xs pt-1">{active === i ? '▲' : '▼'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabella tech stack */}
            <div>
              <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3">Stack tecnologico</p>
              <div className="grid grid-cols-2 gap-2">
                {tech.map(t => (
                  <div key={t.name} className="flex items-center gap-2.5 p-2.5 rounded-xl border" style={{background: `${t.color}08`, borderColor: `${t.color}20`}}>
                    <span className="text-lg">{t.icon}</span>
                    <div>
                      <div className="text-white text-xs font-bold">{t.name}</div>
                      <div className="text-gray-600 text-xs">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motto */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/15 text-center">
              <p className="text-white text-sm font-semibold" style={{fontFamily:'Georgia, serif'}}>
                "Studia meno, impara di più"
              </p>
              <p className="text-gray-500 text-xs mt-1">Pomodoro × Feynman × AI</p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
