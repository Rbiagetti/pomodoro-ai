import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PomodoroTimer from './PomodoroTimer'
import HowItWorks from './HowItWorks'

export default function Layout({ children, onLogout, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: '🍅', label: 'Studia', path: '/' },
    { icon: '📚', label: 'Sessioni', path: '/sessioni' },
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
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200"
                style={location.pathname === item.path
                  ? {background:'rgba(232,99,58,0.15)', color:'var(--accent1)', border:'1px solid rgba(232,99,58,0.2)'}
                  : {color:'var(--muted)', border:'1px solid transparent'}
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={() => { onLogout(); setSidebarOpen(false) }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 w-full"
            style={{color:'var(--muted)', border:'1px solid transparent'}}
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
          style={{background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)'}}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect y="2" width="18" height="1.5" rx="1" fill="var(--text2)"/>
            <rect y="8.25" width="18" height="1.5" rx="1" fill="var(--text2)"/>
            <rect y="14.5" width="18" height="1.5" rx="1" fill="var(--text2)"/>
          </svg>
        </button>
        <PomodoroTimer />
      </div>

      {/* Content */}
      <div className="pt-16 relative z-10">
        {children}
      </div>

      {/* How it works — solo in home */}
      {location.pathname === '/' && <HowItWorks />}
    </div>
  )
}
