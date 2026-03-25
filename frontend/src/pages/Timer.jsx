import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Timer as TimerIcon, Coffee } from 'lucide-react'
import { startPomodoro, setBreakMinutes } from '../components/PomodoroTimer'

function StepPicker({ value, onChange, min, max, step, accent }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-9 h-9 rounded-2xl font-bold text-lg flex items-center justify-center transition-all active:scale-95"
        style={{background:`${accent}15`, border:`1px solid ${accent}30`, color:accent}}
      >−</button>
      <span className="font-bold text-xl w-20 text-center" style={{color:'var(--text)', fontFamily:"'Space Mono', monospace"}}>
        {value}<span className="text-sm font-normal ml-1" style={{color:'var(--muted)'}}>min</span>
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-9 h-9 rounded-2xl font-bold text-lg flex items-center justify-center transition-all active:scale-95"
        style={{background:`${accent}15`, border:`1px solid ${accent}30`, color:accent}}
      >+</button>
    </div>
  )
}

export default function Timer() {
  const navigate = useNavigate()
  const [argomento, setArgomento] = useState('')
  const [durata, setDurata] = useState(25)
  const [pausa, setPausa] = useState(5)

  const start = () => {
    if (!argomento.trim()) return
    localStorage.setItem('argomento', argomento)
    localStorage.setItem('durata', durata)
    setBreakMinutes(pausa)
    startPomodoro(durata)
    navigate('/pomodoro', { state: { argomento, durata } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-2xl overflow-hidden" style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))'}}>
            <img src="/logo.png" alt="Pomodoro AI" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>
            Cosa studi oggi?
          </h1>
          <p style={{color:'var(--muted)', fontSize:'14px'}}>Inserisci l'argomento e inizia il tuo pomodoro</p>
        </div>

        <div className="rounded-2xl p-6 space-y-5" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <input
            type="text"
            placeholder="es. La fotosintesi, Python..."
            value={argomento}
            onChange={e => setArgomento(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && start()}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
          />

          <div className="rounded-2xl p-4" style={{background:'rgba(232,99,58,0.06)', border:'1px solid rgba(232,99,58,0.12)'}}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <TimerIcon size={14} color="var(--muted)" />
              <p className="text-xs text-center uppercase tracking-widest" style={{color:'var(--muted)'}}>Durata pomodoro</p>
            </div>
            <StepPicker value={durata} onChange={setDurata} min={5} max={120} step={5} accent="var(--accent1)" />
          </div>

          <div className="rounded-2xl p-4" style={{background:'rgba(90,158,111,0.06)', border:'1px solid rgba(90,158,111,0.12)'}}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Coffee size={14} color="var(--muted)" />
              <p className="text-xs text-center uppercase tracking-widest" style={{color:'var(--muted)'}}>Durata pausa</p>
            </div>
            <StepPicker value={pausa} onChange={setPausa} min={1} max={30} step={1} accent="var(--success)" />
          </div>

          <button
            onClick={start}
            disabled={!argomento.trim()}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            style={{background: argomento.trim() ? 'linear-gradient(135deg, var(--accent1), var(--accent2))' : 'var(--surface2)', color:'var(--text)'}}
          >
            <Play size={16} /> Inizia sessione
          </button>
        </div>
      </div>
    </div>
  )
}
