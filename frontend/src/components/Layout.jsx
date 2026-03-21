import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PomodoroTimer from './PomodoroTimer'
import HowItWorks from './HowItWorks'
import { useLocation } from 'react-router-dom'

export default function Layout({ children, onLogout, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: '🍅', label: 'Studia', path: '/' },
    { icon: '📚', label: 'Sessioni', path: '/sessioni' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-[100px] animate-pulse" style={{animationDelay:'1.5s'}} />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-pink-600/6 blur-[80px] animate-pulse" style={{animationDelay:'3s'}} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full bg-[#0f0f18]/95 backdrop-blur-xl border-r border-white/5 flex flex-col p-6">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-xl shadow-lg shadow-red-500/30">
              🍅
            </div>
            <div>
              <div className="text-white font-bold tracking-tight" style={{fontFamily:'Georgia, serif'}}>Pomodoro AI</div>
              <div className="text-gray-500 text-xs">{user?.email}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => { onLogout(); setSidebarOpen(false) }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 transition-all duration-200 backdrop-blur-sm"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect y="2" width="18" height="1.5" rx="1" fill="currentColor"/>
            <rect y="8.25" width="18" height="1.5" rx="1" fill="currentColor"/>
            <rect y="14.5" width="18" height="1.5" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <PomodoroTimer />
      </div>

      {location.pathname === '/' && <HowItWorks />}
      <div className="pt-16 relative z-10">
        {children}
      </div>
    </div>
  )
}
