import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startPomodoro, setBreakMinutes } from '../components/PomodoroTimer'

function StepPicker({ value, onChange, min, max, step, color }) {
  const decrease = () => onChange(Math.max(min, value - step))
  const increase = () => onChange(Math.min(max, value + step))

  const btnClass = `w-9 h-9 rounded-xl font-bold text-lg flex items-center justify-center transition-all active:scale-95 ${
    color === 'red'
      ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
      : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
  }`

  const valClass = `text-white font-bold text-xl w-16 text-center ${
    color === 'red' ? 'text-red-100' : 'text-emerald-100'
  }`

  return (
    <div className="flex items-center justify-center gap-4">
      <button onClick={decrease} className={btnClass}>−</button>
      <span className={valClass}>{value} <span className="text-sm font-normal text-gray-500">min</span></span>
      <button onClick={increase} className={btnClass}>+</button>
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
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 via-orange-400 to-pink-500 items-center justify-center text-4xl mb-4 shadow-2xl shadow-red-500/30">
            🍅
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            Cosa studi oggi?
          </h1>
          <p className="text-gray-500 text-sm mt-2">Inserisci l'argomento e inizia il tuo pomodoro</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-6">

          <input
            type="text"
            placeholder="es. La fotosintesi, Python..."
            value={argomento}
            onChange={e => setArgomento(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && start()}
            className="w-full bg-white/5 text-white placeholder-gray-600 rounded-2xl px-5 py-4 outline-none border border-white/10 focus:border-red-500/50 transition-all text-sm"
          />

          {/* Pomodoro picker */}
          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-4">
            <p className="text-gray-500 text-xs text-center mb-3 uppercase tracking-wider">🍅 Durata pomodoro</p>
            <StepPicker value={durata} onChange={setDurata} min={5} max={120} step={5} color="red" />
          </div>

          {/* Pausa picker */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4">
            <p className="text-gray-500 text-xs text-center mb-3 uppercase tracking-wider">☕ Durata pausa</p>
            <StepPicker value={pausa} onChange={setPausa} min={1} max={30} step={1} color="green" />
          </div>

          <button
            onClick={start}
            disabled={!argomento.trim()}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group"
            style={{background: argomento.trim() ? 'linear-gradient(135deg, #ef4444, #f97316, #ec4899)' : '#1f1f2e'}}
          >
            <span className="relative z-10">▶ Inizia sessione</span>
            {argomento.trim() && (
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
