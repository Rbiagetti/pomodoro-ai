import { useState, useEffect, useRef } from 'react'
import { Clock, Pause, Play, Volume2, VolumeX, MessageCircle, Coffee } from 'lucide-react'

// ── Stato globale ─────────────────────────────────────────────────────────────
let g = {
  phase: 'IDLE',
  timeLeft: 0,
  running: false,
  workMinutes: 25,
  breakMinutes: 5,
  soundEnabled: true,
  listeners: [],
}

function notify() { g.listeners.forEach(l => l()) }

export function startPomodoro(minutes) {
  g.phase = 'POMODORO_ACTIVE'
  g.timeLeft = minutes * 60
  g.workMinutes = minutes
  g.running = true
  playSound('start')
  notify()
}

export function enterChat() {
  g.phase = 'CHAT_ACTIVE'
  g.timeLeft = 0
  g.running = false
  notify()
}

export function endChat() {
  g.phase = 'BREAK_ACTIVE'
  g.timeLeft = g.breakMinutes * 60
  g.running = true
  playSound('breakStart')
  notify()
}

export function setBreakMinutes(m) { g.breakMinutes = m; notify() }

export function resetTimer() {
  g.phase = 'IDLE'
  g.timeLeft = 0
  g.running = false
  notify()
}

function playSound(type) {
  if (!g.soundEnabled) return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const sounds = {
      start:      [{ f: 440, t: 0, dur: 0.15 }, { f: 550, t: 0.18, dur: 0.15 }, { f: 660, t: 0.36, dur: 0.25 }],
      workEnd:    [{ f: 880, t: 0, dur: 0.3 }, { f: 880, t: 0.35, dur: 0.3 }, { f: 660, t: 0.7, dur: 0.5 }],
      breakStart: [{ f: 523, t: 0, dur: 0.4 }, { f: 659, t: 0.45, dur: 0.4 }],
      breakEnd:   [{ f: 659, t: 0, dur: 0.2 }, { f: 523, t: 0.25, dur: 0.2 }, { f: 440, t: 0.5, dur: 0.3 }],
    }
    sounds[type]?.forEach(({ f, t, dur }) => {
      const o = ctx.createOscillator()
      const gain = ctx.createGain()
      o.connect(gain); gain.connect(ctx.destination)
      o.frequency.value = f
      o.type = 'sine'
      gain.gain.setValueAtTime(0.25, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + dur + 0.05)
    })
  } catch(e) {}
}

export function useTimerState() {
  const [state, setState] = useState({ ...g })
  useEffect(() => {
    const l = () => setState({ ...g })
    g.listeners.push(l)
    return () => { g.listeners = g.listeners.filter(x => x !== l) }
  }, [])
  return state
}

const PHASE_STYLE = {
  IDLE:            { label: 'Timer',    color: '#9a8878',    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,180,80,0.08)' },
  POMODORO_ACTIVE: { label: 'Focus',    color: '#ff6b3d',    bg: 'rgba(255,107,61,0.12)', border: 'rgba(255,107,61,0.25)' },
  CHAT_ACTIVE:     { label: 'Chat',     color: '#c4a24a',    bg: 'rgba(196,162,74,0.12)', border: 'rgba(196,162,74,0.25)' },
  BREAK_ACTIVE:    { label: 'Pausa',    color: '#5a9e6f',    bg: 'rgba(90,158,111,0.12)', border: 'rgba(90,158,111,0.25)' },
}

const PHASE_ICON = {
  IDLE:            Clock,
  POMODORO_ACTIVE: Clock,
  CHAT_ACTIVE:     MessageCircle,
  BREAK_ACTIVE:    Coffee,
}

export default function PomodoroTimer() {
  const state = useTimerState()
  const intervalRef = useRef(null)

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!g.running) return
    intervalRef.current = setInterval(() => {
      if (g.timeLeft > 0) {
        g.timeLeft -= 1
        notify()
      } else {
        clearInterval(intervalRef.current)
        if (g.phase === 'POMODORO_ACTIVE') {
          playSound('workEnd')
          enterChat()
        } else if (g.phase === 'BREAK_ACTIVE') {
          playSound('breakEnd')
          resetTimer()
        }
      }
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [state.running, state.phase])

  const mins = String(Math.floor(state.timeLeft / 60)).padStart(2, '0')
  const secs = String(state.timeLeft % 60).padStart(2, '0')
  const style = PHASE_STYLE[state.phase]
  const PhaseIcon = PHASE_ICON[state.phase]

  const toggleSound = () => { g.soundEnabled = !g.soundEnabled; notify() }
  const togglePause = () => { g.running = !g.running; notify() }

  const SoundIcon = state.soundEnabled ? Volume2 : VolumeX

  if (state.phase === 'IDLE') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm min-w-0"
        style={{background: style.bg, borderColor: style.border}}>
        <Clock size={14} color={style.color} />
        <span className="text-xs" style={{color: style.color}}>Pronto</span>
        <button onClick={toggleSound} className="ml-1 transition opacity-50 hover:opacity-100">
          <SoundIcon size={12} color={style.color} />
        </button>
      </div>
    )
  }

  if (state.phase === 'CHAT_ACTIVE') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm min-w-0"
        style={{background: style.bg, borderColor: style.border}}>
        <MessageCircle size={14} color={style.color} />
        <button onClick={toggleSound} className="ml-1 transition opacity-50 hover:opacity-100">
          <SoundIcon size={12} color={style.color} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-xl shadow-lg min-w-0"
      style={{background: style.bg, borderColor: style.border}}>
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center opacity-70">
          <PhaseIcon size={10} color={style.color} />
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{color: style.color}}>{style.label}</span>
        </div>
        <div className="font-mono font-bold text-lg leading-tight tracking-widest text-center" style={{color: style.color}}>{mins}:{secs}</div>
      </div>
      <div className="flex gap-1">
        <button onClick={togglePause} className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:scale-110 border"
          style={{background: style.bg, borderColor: style.border}}>
          {state.running ? <Pause size={12} color={style.color} /> : <Play size={12} color={style.color} />}
        </button>
        <button onClick={toggleSound} className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 transition hover:scale-110">
          <SoundIcon size={12} color={style.color} />
        </button>
      </div>
    </div>
  )
}
