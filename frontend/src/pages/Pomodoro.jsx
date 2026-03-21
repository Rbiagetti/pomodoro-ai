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
  const r = 80
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - progress)

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-gray-500 text-sm mb-1">Stai studiando</p>
        <h2 className="text-white font-bold text-xl mb-10" style={{fontFamily:'Georgia, serif'}}>
          {argomento}
        </h2>

        <div className="relative inline-flex items-center justify-center mb-10">
          <svg width="220" height="220" className="rotate-[-90deg]">
            <circle cx="110" cy="110" r={r} fill="none" stroke="#ffffff08" strokeWidth="8"/>
            <circle
              cx="110" cy="110" r={r} fill="none"
              stroke="url(#grad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{transition: 'stroke-dashoffset 1s linear'}}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono font-bold text-5xl text-white leading-none tracking-widest">{mins}:{secs}</div>
            <div className="text-gray-500 text-xs mt-2">🍅 pomodoro</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
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
    </div>
  )
}
