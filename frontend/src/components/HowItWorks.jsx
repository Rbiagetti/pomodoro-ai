import { useState } from 'react'
import { Timer, Mic, Brain, Bot, Coffee, Info, X, Cpu, Zap, Database, Globe } from 'lucide-react'

const steps = [
  { icon: Timer, title: 'Avvia il Pomodoro', desc: '25 min di focus puro. Il telefono può aspettare!', color: '#ff6b3d', detail: 'Francesco Cirillo nel 1987 scoprì che lavorare a blocchi di tempo aumenta la produttività. Dai un limite al tempo e la concentrazione esplode!' },
  { icon: Mic, title: 'Spiega a voce', desc: 'Racconta tutto come se lo spiegassi a un amico.', color: '#f0943a', detail: 'Richard Feynman, premio Nobel: se non riesci a spiegarlo in parole semplici, non lo hai capito davvero. Parla, e scoprirai cosa sai — e cosa no!' },
  { icon: Brain, title: 'Analisi AI', desc: "L'AI trova i buchi che non sapevi di avere.", color: '#e8b84a', detail: "Whisper trascrive ogni parola, LLaMA 70B analizza il contenuto. Come un tutor invisibile che sa esattamente dove ti sei perso!" },
  { icon: Bot, title: 'Interrogazione socratica', desc: 'Domande scomode che ti fanno crescere.', color: '#c4a24a', detail: "Socrate non dava mai risposte — faceva domande. 2500 anni dopo, è ancora il modo più potente per imparare davvero. L'AI segue le sue orme!" },
  { icon: Coffee, title: 'Pausa meritata', desc: 'Hai finito! Il cervello ora consolida tutto.', color: '#5a9e6f', detail: 'La scienza conferma: durante il riposo il cervello salva i ricordi nella memoria a lungo termine. Stai ancora imparando mentre bevi il caffè.' },
]

const tech = [
  { name: 'Whisper', desc: 'Trascrizione vocale', icon: Mic, color: '#f0943a' },
  { name: 'LLaMA 70B', desc: 'AI socratica', icon: Bot, color: '#c4a24a' },
  { name: 'Supabase', desc: 'Database & Auth', icon: Database, color: '#5a9e6f' },
  { name: 'FastAPI', desc: 'Backend API', icon: Zap, color: '#e8b84a' },
  { name: 'React', desc: 'Frontend', icon: Globe, color: '#ff6b3d' },
  { name: 'Groq', desc: 'Inference veloce', icon: Cpu, color: '#f0943a' },
]

export default function HowItWorks() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [showBubble, setShowBubble] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {showBubble && !open && (
          <div className="relative flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-xl"
            style={{background:'var(--surface)', border:'1px solid var(--border2)'}}
          >
            <span className="text-sm" style={{color:'var(--accent2)'}}>Come funziona?</span>
            <button onClick={() => setShowBubble(false)} className="transition opacity-50 hover:opacity-100" style={{color:'var(--muted)'}}>
              <X size={12} />
            </button>
            <div className="absolute bottom-[-6px] right-4 w-3 h-3 rotate-45"
              style={{background:'var(--surface)', borderRight:'1px solid var(--border2)', borderBottom:'1px solid var(--border2)'}}
            />
          </div>
        )}
        <button
          onClick={() => { setOpen(true); setShowBubble(false) }}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
          style={{background:'var(--surface)', border:'1px solid var(--border2)'}}
        >
          <Info size={18} color="var(--text2)" />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-50 backdrop-blur-sm" style={{background:'rgba(0,0,0,0.4)'}} onClick={() => setOpen(false)} />}

      <div className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col" style={{background:'var(--surface)', borderLeft:'1px solid var(--border)'}}>

          {/* Header */}
          <div className="p-5" style={{borderBottom:'1px solid var(--border)'}}>
            <h3 className="font-bold text-xl" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>
              Come funziona
            </h3>
            <p className="text-xs mt-1" style={{color:'var(--muted)'}}>Feynman + Socrate + AI</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* Steps */}
            <div className="space-y-1">
              {steps.map((step, i) => {
                const Icon = step.icon
                return (
                  <button key={i}
                    onClick={() => setActive(active === i ? null : i)}
                    className="w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all"
                    style={active === i
                      ? {background:`${step.color}12`, border:`1px solid ${step.color}25`}
                      : {border:'1px solid transparent'}
                    }
                  >
                    <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center border"
                      style={{background:`${step.color}15`, borderColor:`${step.color}30`}}
                    >
                      <Icon size={18} color={step.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{color:step.color, fontFamily:"'Space Mono', monospace"}}>0{i+1}</span>
                        <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{step.title}</span>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{color:'var(--muted)'}}>{step.desc}</p>
                      {active === i && (
                        <div className="mt-2 p-3 rounded-xl text-xs leading-relaxed" style={{background:`${step.color}10`, color:step.color, border:`1px solid ${step.color}20`}}>
                          {step.detail}
                        </div>
                      )}
                    </div>
                    <span className="text-xs pt-1" style={{color:'var(--muted)'}}>{active === i ? '▲' : '▼'}</span>
                  </button>
                )
              })}
            </div>

            {/* Tech stack */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{color:'var(--muted)'}}>Chi c'è sotto il cofano</p>
              <div className="grid grid-cols-2 gap-2">
                {tech.map(t => {
                  const Icon = t.icon
                  return (
                    <div key={t.name} className="flex items-center gap-2.5 p-2.5 rounded-2xl border"
                      style={{background:`${t.color}08`, borderColor:`${t.color}20`}}
                    >
                      <Icon size={18} color={t.color} />
                      <div>
                        <div className="text-xs font-bold" style={{color:'var(--text)'}}>{t.name}</div>
                        <div className="text-xs" style={{color:'var(--muted)'}}>{t.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quote */}
            <div className="p-4 rounded-2xl text-center" style={{background:'rgba(255,107,61,0.08)', border:'1px solid rgba(255,107,61,0.15)'}}>
              <p className="text-sm font-semibold" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>
                "Se non riesci a spiegarlo, non lo hai capito"
              </p>
              <p className="text-xs mt-1" style={{color:'var(--muted)'}}>— Richard Feynman</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="mx-5 mb-5 mt-2 rounded-full font-bold text-sm transition flex items-center justify-center gap-2"
            style={{background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)', padding:'12px', color:'var(--text2)'}}
          >
            <X size={14} /> Chiudi
          </button>
        </div>
      </div>
    </>
  )
}
