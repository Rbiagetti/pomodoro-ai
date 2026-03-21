import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTimerState, enterChat } from '../components/PomodoroTimer'

export default function Pomodoro() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const timerState = useTimerState()

  const argomento = state?.argomento || localStorage.getItem('argomento')
  const durata = state?.durata || localStorage.getItem('durata') || 25

  useEffect(() => {
    if (timerState.phase === 'CHAT_ACTIVE') {
      navigate('/sintesi', { state: { argomento, durata } })
    }
  }, [timerState.phase])

  const mins = String(Math.floor(timerState.timeLeft / 60)).padStart(2, '0')
  const secs = String(timerState.timeLeft % 60).padStart(2, '0')
  const totalSecs = Number(durata) * 60
  const progress = totalSecs > 0 ? (totalSecs - timerState.timeLeft) / totalSecs : 0

  const size = 280
  const stroke = 6
  const r = (size / 2) - stroke * 2
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - progress)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">

      <div className="text-center">
        <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">Stai studiando</p>
        <h2 className="text-white font-bold text-2xl">{argomento}</h2>
      </div>

      {/* Timer circle */}
      <div className="relative flex items-center justify-center">

        {/* Glow esterno */}
        <div
          className="absolute rounded-full"
          style={{
            width: size + 40,
            height: size + 40,
            background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
          }}
        />

        <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
          {/* Track */}
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke="url(#grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            style={{transition: 'stroke-dashoffset 1s linear'}}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444"/>
              <stop offset="100%" stopColor="#f97316"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Testo nel cerchio */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-white leading-none"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '52px',
              fontWeight: '700',
              letterSpacing: '-2px',
            }}
          >
            {mins}<span className="text-red-500/70 mx-1">:</span>{secs}
          </div>
          <div className="text-gray-600 text-xs mt-3 tracking-widest uppercase">
            🍅 pomodoro
          </div>
        </div>
      </div>

      {/* Azioni */}
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={() => { enterChat(); navigate('/sintesi', { state: { argomento, durata } }) }}
          className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
        >
          ⏭ Salta alla sintesi
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 text-sm transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
