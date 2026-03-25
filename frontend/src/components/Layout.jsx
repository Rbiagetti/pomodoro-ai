import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Timer, BookOpen, LogOut, Menu, Bot, Mic, Coffee } from 'lucide-react'
import PomodoroTimer from './PomodoroTimer'
import Flame from './Flame'
import StreakModal from './StreakModal'
import FloatingStreak from './FloatingStreak'
import HowItWorks from './HowItWorks'
import API from '../services/api'

function calcStreak(sessioni) {
  const dates = [...new Set(
    sessioni.map(s => s.study_date || s.created_at?.split('T')[0])
  )].filter(Boolean).sort().reverse()

  const today = new Date().toISOString().split('T')[0]

  const studiedToday = dates.includes(today)

  // Se ho studiato oggi parto da oggi, altrimenti da ieri
  // In entrambi i casi il numero mostrato è quello "congelato" se non ho studiato oggi
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  let streak = 0
  let expected = studiedToday ? today : yesterday
  for (const d of dates) {
    if (d === expected) {
      streak++
      const dt = new Date(expected)
      dt.setDate(dt.getDate() - 1)
      expected = dt.toISOString().split('T')[0]
    } else if (d < expected) {
      break
    }
  }

  return { streak, studiedToday }
}

const PHASE_PILLS = {
  '/pomodoro':       { icon: Timer, label: 'Focus', color: '#ff6b3d', bg: 'rgba(255,107,61,0.15)', border: 'rgba(255,107,61,0.3)' },
  '/sintesi':        { icon: Mic, label: 'Sintesi', color: '#f0943a', bg: 'rgba(240,148,58,0.15)', border: 'rgba(240,148,58,0.3)' },
  '/interrogazione': { icon: Bot, label: 'Interrogazione', color: '#c4a24a', bg: 'rgba(196,162,74,0.15)', border: 'rgba(196,162,74,0.3)' },
  '/sessioni':       { icon: BookOpen, label: 'Sessioni', color: '#7a9e8a', bg: 'rgba(122,158,138,0.15)', border: 'rgba(122,158,138,0.3)' },
}

export default function Layout({ children, onLogout, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [studiedToday, setStudiedToday] = useState(false)
  const [streakLoaded, setStreakLoaded] = useState(false)
  const [sessioni, setSessioni] = useState([])
  const [streakOpen, setStreakOpen] = useState(false)
  const [flameRect, setFlameRect] = useState(null)
  const [pillVisible, setPillVisible] = useState(false)
  const flameRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  const activePill = PHASE_PILLS[location.pathname]

  useEffect(() => {
    if (activePill) {
      const t = setTimeout(() => setPillVisible(true), 50)
      return () => clearTimeout(t)
    } else {
      setPillVisible(false)
    }
  }, [location.pathname])

  const fetchStreak = () => {
    if (!user) return
    API.get('/sessions').then(({ data }) => {
      setSessioni(data)
      const { streak: s, studiedToday: st } = calcStreak(data)
      setStreak(s)
      setStudiedToday(st)
      setStreakLoaded(true)
    }).catch(() => {})
  }

  useEffect(() => {
    fetchStreak()
    window.addEventListener('session-saved', fetchStreak)
    return () => window.removeEventListener('session-saved', fetchStreak)
  }, [user])

  const navItems = [
    { icon: Timer, label: 'Studia', path: '/' },
    { icon: BookOpen, label: 'Sessioni', path: '/sessioni' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background:'var(--bg)'}}>

      {/* Warm ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{background:'rgba(232,99,58,0.06)'}} />
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{background:'rgba(212,135,58,0.05)'}} />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-sm" style={{background:'rgba(0,0,0,0.6)'}} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6 border-r" style={{background:'rgba(20,18,16,0.98)', backdropFilter:'blur(20px)', borderColor:'var(--border)'}}>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden" style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))'}}>
              <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="font-bold tracking-tight" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", fontSize:'15px'}}>Pomodoro AI</div>
              <div className="text-xs truncate max-w-[130px]" style={{color:'var(--muted)'}}>{user?.email}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                  style={location.pathname === item.path
                    ? {background:'rgba(232,99,58,0.15)', color:'var(--accent1)', border:'1px solid rgba(232,99,58,0.2)'}
                    : {color:'var(--muted)', border:'1px solid transparent'}
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={() => { onLogout(); setSidebarOpen(false) }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 w-full"
            style={{color:'var(--muted)', border:'1px solid transparent'}}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center px-4 py-3 gap-2" style={{background:'rgba(12,10,8,0.6)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,180,80,0.06)'}}>

        {/* Sinistra — hamburger */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)'}}
          >
            <Menu size={18} color="var(--text2)" />
          </button>
        </div>

        {/* Centro — pillola fase */}
        <div className="flex-1 flex justify-center">
          {activePill && (
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{
                transform: pillVisible ? 'scale(1)' : 'scale(0.3)',
                opacity: pillVisible ? 1 : 0,
                transition: 'transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.25s ease',
                background: activePill.bg,
                border: `1px solid ${activePill.border}`,
              }}
            >
              <activePill.icon size={14} color={activePill.color} />
              <span className="text-sm font-bold" style={{color: activePill.color, fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>{activePill.label}</span>
            </div>
          )}
        </div>

        {/* Destra — solo sound + pause se non su /pomodoro, solo sound se su /pomodoro */}
        <div className="flex-shrink-0">
          <PomodoroTimer hideCountdown={location.pathname === '/pomodoro'} />
        </div>
      </div>



      {/* Content */}
      <div className="pt-16 pb-8 relative z-10">
        {children}
      </div>

      {/* How it works — solo in home */}

      {/* Floating streak widget — nascosta nelle pagine attive */}
      {!['/pomodoro', '/sintesi', '/interrogazione'].includes(location.pathname) && (
        <FloatingStreak
          streak={streak}
          studiedToday={studiedToday}
          loaded={streakLoaded}
          onOpen={(rect) => { setFlameRect(rect); setStreakOpen(true) }}
        />
      )}

      {location.pathname === '/' && <HowItWorks />}

      {/* Streak modal */}
      {streakOpen && (
        <StreakModal sessioni={sessioni} currentStreak={streak} onClose={() => setStreakOpen(false)} originRect={flameRect} />
      )}
    </div>
  )
}
