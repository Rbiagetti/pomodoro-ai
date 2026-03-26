import { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Zap, Timer, Mic, Bot, Flame, BarChart2, Brain } from 'lucide-react'

const STORAGE_KEY = 'pomodoro_onboarded'

const slides = [
  {
    title: 'Studia come Feynman',
    subtitle: 'Il metodo che trasforma la comprensione in vera conoscenza',
    color: '#ff6b3d',
    illustration: (
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%', maxWidth:220}}>
        <circle cx="100" cy="55" r="32" fill="rgba(255,107,61,0.15)" stroke="rgba(255,107,61,0.4)" strokeWidth="1.5"/>
        <circle cx="100" cy="55" r="22" fill="rgba(255,107,61,0.1)"/>
        <circle cx="100" cy="55" r="10" fill="rgba(255,107,61,0.3)"/>
        <path d="M96 55 L100 48 L104 55" stroke="#ff6b3d" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M60 55 Q70 45 80 55" stroke="rgba(255,107,61,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M55 55 Q70 38 85 55" stroke="rgba(255,107,61,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M140 55 Q130 45 120 55" stroke="rgba(255,107,61,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M145 55 Q130 38 115 55" stroke="rgba(255,107,61,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M78 87 Q100 95 122 87 L118 120 Q100 128 82 120 Z" fill="rgba(255,107,61,0.12)" stroke="rgba(255,107,61,0.3)" strokeWidth="1.5"/>
        <rect x="68" y="100" width="26" height="18" rx="2" fill="rgba(240,148,58,0.2)" stroke="rgba(240,148,58,0.5)" strokeWidth="1"/>
        <line x1="81" y1="100" x2="81" y2="118" stroke="rgba(240,148,58,0.5)" strokeWidth="1"/>
        <rect x="106" y="100" width="26" height="18" rx="2" fill="rgba(240,148,58,0.2)" stroke="rgba(240,148,58,0.5)" strokeWidth="1"/>
        <line x1="119" y1="100" x2="119" y2="118" stroke="rgba(240,148,58,0.5)" strokeWidth="1"/>
        <circle cx="40" cy="30" r="2" fill="rgba(255,107,61,0.4)"/>
        <circle cx="160" cy="25" r="1.5" fill="rgba(240,148,58,0.4)"/>
        <circle cx="30" cy="80" r="1" fill="rgba(255,107,61,0.3)"/>
        <circle cx="170" cy="75" r="2" fill="rgba(240,148,58,0.3)"/>
      </svg>
    ),
    points: [
      { icon: Timer, text: '25 minuti di focus puro. Il telefono può aspettare!' },
      { icon: Mic, text: 'Racconta tutto come se lo spiegassi a un amico.' },
      { icon: Bot, text: "L'AI trova i buchi che non sapevi di avere." },
    ]
  },
  {
    title: 'Il flusso in 3 fasi',
    subtitle: 'Ogni sessione segue sempre lo stesso percorso',
    color: '#f0943a',
    illustration: (
      <svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%', maxWidth:260}}>
        {/* Cerchio 1 — Focus */}
        <circle cx="40" cy="55" r="22" fill="rgba(255,107,61,0.12)" stroke="rgba(255,107,61,0.4)" strokeWidth="1.5"/>
        <text x="40" y="59" textAnchor="middle" dominantBaseline="middle" fill="#ff6b3d" fontSize="10" fontWeight="700" fontFamily="monospace">25'</text>
        {/* Freccia 1→2 */}
        <line x1="64" y1="55" x2="84" y2="55" stroke="rgba(240,148,58,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
        <polyline points="80,51 84,55 80,59" fill="none" stroke="rgba(240,148,58,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Cerchio 2 — Sintesi */}
        <circle cx="120" cy="55" r="22" fill="rgba(240,148,58,0.12)" stroke="rgba(240,148,58,0.4)" strokeWidth="1.5"/>
        <rect x="114" y="44" width="12" height="18" rx="6" fill="rgba(240,148,58,0.35)" stroke="rgba(240,148,58,0.7)" strokeWidth="1.5"/>
        <path d="M111 58 Q111 67 120 67 Q129 67 129 58" stroke="rgba(240,148,58,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <line x1="120" y1="67" x2="120" y2="71" stroke="rgba(240,148,58,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Freccia 2→3 */}
        <line x1="144" y1="55" x2="164" y2="55" stroke="rgba(196,162,74,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
        <polyline points="160,51 164,55 160,59" fill="none" stroke="rgba(196,162,74,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Cerchio 3 — Interrogazione */}
        <circle cx="200" cy="55" r="22" fill="rgba(196,162,74,0.12)" stroke="rgba(196,162,74,0.4)" strokeWidth="1.5"/>
        <rect x="191" y="46" width="18" height="14" rx="3" fill="rgba(196,162,74,0.2)" stroke="rgba(196,162,74,0.6)" strokeWidth="1.5"/>
        <circle cx="196" cy="53" r="1.8" fill="rgba(196,162,74,0.8)"/>
        <circle cx="204" cy="53" r="1.8" fill="rgba(196,162,74,0.8)"/>
        <path d="M194 57 Q200 61 206 57" stroke="rgba(196,162,74,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        {/* Labels */}
        <text x="40" y="87" textAnchor="middle" fill="rgba(255,107,61,0.6)" fontSize="9" fontFamily="sans-serif">Focus</text>
        <text x="120" y="87" textAnchor="middle" fill="rgba(240,148,58,0.6)" fontSize="9" fontFamily="sans-serif">Sintesi</text>
        <text x="200" y="87" textAnchor="middle" fill="rgba(196,162,74,0.6)" fontSize="9" fontFamily="sans-serif">Interrogazione</text>
      </svg>
    ),
    points: [
      { icon: Timer, text: 'Studia per 25 minuti senza distrazioni' },
      { icon: Mic, text: 'Registra una spiegazione vocale di ciò che ricordi' },
      { icon: Bot, text: "L'AI ti fa domande socratiche sulle lacune" },
    ]
  },
  {
    title: 'Pronto a iniziare?',
    subtitle: 'La prima sessione è quella che conta di più',
    color: '#5a9e6f',
    illustration: (
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%', maxWidth:220}}>
        <path d="M100 20 Q115 35 118 65 L100 75 L82 65 Q85 35 100 20Z" fill="rgba(90,158,111,0.2)" stroke="rgba(90,158,111,0.5)" strokeWidth="1.5"/>
        <circle cx="100" cy="52" r="8" fill="rgba(90,158,111,0.3)" stroke="rgba(90,158,111,0.6)" strokeWidth="1.5"/>
        <path d="M82 65 L68 80 L82 78 Z" fill="rgba(90,158,111,0.15)" stroke="rgba(90,158,111,0.4)" strokeWidth="1.5"/>
        <path d="M118 65 L132 80 L118 78 Z" fill="rgba(90,158,111,0.15)" stroke="rgba(90,158,111,0.4)" strokeWidth="1.5"/>
        <path d="M94 78 Q97 90 100 95 Q103 90 106 78" fill="rgba(255,107,61,0.3)" stroke="rgba(255,107,61,0.5)" strokeWidth="1"/>
        <circle cx="50" cy="40" r="2" fill="rgba(90,158,111,0.4)"/>
        <circle cx="150" cy="35" r="2.5" fill="rgba(90,158,111,0.3)"/>
        <circle cx="35" cy="90" r="1.5" fill="rgba(255,107,61,0.3)"/>
        <circle cx="165" cy="85" r="2" fill="rgba(255,107,61,0.3)"/>
        <path d="M40 130 Q70 100 100 95 Q130 100 160 130" stroke="rgba(90,158,111,0.15)" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
        <circle cx="40" cy="130" r="8" fill="rgba(90,158,111,0.15)" stroke="rgba(90,158,111,0.3)" strokeWidth="1"/>
        <path d="M36 130 L39 133 L44 127" stroke="rgba(90,158,111,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="100" cy="140" r="8" fill="rgba(90,158,111,0.15)" stroke="rgba(90,158,111,0.3)" strokeWidth="1"/>
        <path d="M96 140 L99 143 L104 137" stroke="rgba(90,158,111,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="160" cy="130" r="8" fill="rgba(90,158,111,0.15)" stroke="rgba(90,158,111,0.3)" strokeWidth="1"/>
        <path d="M156 130 L159 133 L164 127" stroke="rgba(90,158,111,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    points: [
      { icon: Flame, text: 'Costruisci una streak di studio giornaliera' },
      { icon: BarChart2, text: 'Tieni traccia dei tuoi progressi nelle sessioni' },
      { icon: Brain, text: 'Ogni sessione rafforza la tua memoria a lungo termine' },
    ]
  }
]

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [direction, setDirection] = useState(1)
  const [animating, setAnimating] = useState(false)
  const touchStart = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const goTo = (newStep) => {
    if (animating) return
    setDirection(newStep > step ? 1 : -1)
    setAnimating(true)
    setTimeout(() => {
      setStep(newStep)
      setAnimating(false)
    }, 220)
  }

  const handleClose = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, '1')
    setTimeout(onClose, 300)
  }

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(dx) > 50) {
      if (dx < 0 && step < slides.length - 1) goTo(step + 1)
      if (dx > 0 && step > 0) goTo(step - 1)
    }
    touchStart.current = null
  }

  const slide = slides[step]

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{
          background: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
          transition: 'all 0.3s ease',
        }}
        onClick={handleClose}
      />
      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: '50%', left: '50%',
          transform: visible ? 'translate(-50%, -50%) translateY(0)' : 'translate(-50%, -50%) translateY(60px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.34,1.3,0.64,1), opacity 0.3s ease',
          width: 'min(400px, 92vw)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition z-10"
          style={{background:'rgba(255,255,255,0.06)', color:'var(--muted)'}}
        >
          <X size={14} />
        </button>

        <div
          className="flex flex-col items-center px-6 pt-6 pb-3"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? `translateX(${direction * 30}px)` : 'translateX(0)',
            transition: animating ? 'none' : 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          <div className="flex items-center justify-center mb-4" style={{height:110}}>
            {slide.illustration}
          </div>
          <h2 className="text-2xl font-bold text-center mb-2" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>
            {slide.title}
          </h2>
          <p className="text-sm text-center mb-4" style={{color:'var(--muted)'}}>
            {slide.subtitle}
          </p>
          <div className="w-full space-y-2 mb-4">
            {slide.points.map((p, i) => {
              const Icon = p.icon
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{background:`${slide.color}0d`, border:`1px solid ${slide.color}20`}}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${slide.color}18`}}>
                    <Icon size={16} color={slide.color} />
                  </div>
                  <span className="text-sm" style={{color:'var(--text2)'}}>{p.text}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 pb-5 flex flex-col gap-2">
          <div className="flex justify-center gap-2 mb-2" style={{height:16, alignItems:'center'}}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="rounded-full"
                style={{
                  width: i === step ? 20 : 6, height: 6,
                  background: i === step ? slide.color : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => goTo(step - 1)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                style={{background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', color:'var(--muted)'}}>
                <ChevronLeft size={16} /> Indietro
              </button>
            )}
            <button
              onClick={step < slides.length - 1 ? () => goTo(step + 1) : handleClose}
              className="flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              style={{background:`linear-gradient(135deg, ${slide.color}, ${slide.color}cc)`, color:'var(--text)'}}>
              {step < slides.length - 1
                ? <><span>Avanti</span><ChevronRight size={14} /></>
                : <><Zap size={14} /><span>Inizia a studiare</span></>
              }
            </button>
          </div>
          {step === 0 && (
            <button onClick={handleClose} className="text-xs text-center py-1 transition" style={{color:'var(--muted)'}}>
              Salta
            </button>
          )}
        </div>
      </div>
    </>
  )
}
