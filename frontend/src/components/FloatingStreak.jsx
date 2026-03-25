import { useState, useEffect } from 'react'
import Flame from './Flame'

export default function FloatingStreak({ streak, studiedToday, loaded, onOpen }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(t)
    }
  }, [loaded])

  const handleClick = () => {
    const el = document.getElementById('streak-pill')
    if (el) onOpen(el.getBoundingClientRect())
  }

  return (
    <button
      id="streak-pill"
      onClick={handleClick}
      className="fixed z-40 flex items-center gap-2 px-3 py-2 rounded-2xl active:scale-95"
      style={{
        bottom: '24px',
        left: '20px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.8)',
        transition: 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.34,1.3,0.64,1)',
        background: studiedToday ? 'rgba(20,16,12,0.9)' : 'rgba(255,255,255,0.03)',
        border: studiedToday ? '1px solid rgba(232,99,58,0.4)' : '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        boxShadow: studiedToday ? '0 4px 24px rgba(232,99,58,0.2)' : 'none',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <Flame size={16} intensity={studiedToday ? Math.min(2, streak / 3 + 0.5) : 0} />
      <span
        className="text-sm font-bold"
        style={{
          color: studiedToday ? '#ff6b3d' : 'var(--muted)',
          fontFamily: "'Space Mono', monospace",
          opacity: studiedToday ? 1 : 0.4,
        }}
      >
        {streak}
      </span>
    </button>
  )
}
