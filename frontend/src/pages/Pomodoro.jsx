import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SkipForward, X } from 'lucide-react'
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
  const stroke = 5
  const r = (size / 2) - stroke * 2
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - progress)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-2" style={{color:'var(--muted)'}}>Stai studiando</p>
        <h2 className="text-2xl font-bold" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>{argomento}</h2>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute rounded-full" style={{width:size+60, height:size+60, background:'radial-gradient(circle, rgba(232,99,58,0.08) 0%, transparent 70%)'}} />
        <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,180,80,0.06)" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke="url(#warmGrad)" strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{transition:'stroke-dashoffset 1s linear'}}
          />
          <defs>
            <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8633a"/>
              <stop offset="100%" stopColor="#c4a24a"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div style={{fontFamily:"'Space Mono', monospace", fontSize:'52px', fontWeight:'700', letterSpacing:'-2px', color:'var(--text)'}}>
            {mins}<span style={{color:'var(--accent1)', opacity:0.6, margin:'0 2px'}}>:</span>{secs}
          </div>
          <div className="text-xs mt-3 uppercase tracking-widest" style={{color:'var(--muted)'}}>pomodoro</div>
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={() => { enterChat(); navigate('/sintesi', { state: { argomento, durata } }) }}
          className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)'}}
        >
          <SkipForward size={14} /> Salta alla sintesi
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-2xl text-sm transition-all flex items-center justify-center"
          style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted)'}}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
