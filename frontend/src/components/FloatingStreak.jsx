import Flame from './Flame'

export default function FloatingStreak({ streak, studiedToday, onOpen }) {
  const handleClick = () => {
    const el = document.getElementById('streak-pill')
    if (el) onOpen(el.getBoundingClientRect())
  }

  return (
    <button
      id="streak-pill"
      onClick={handleClick}
      className="fixed z-40 flex items-center gap-2 px-3 py-2 rounded-2xl transition-all active:scale-95"
      style={{
        bottom: '24px',
        left: '20px',
        background: studiedToday ? 'rgba(20,16,12,0.9)' : 'rgba(255,255,255,0.03)',
        border: studiedToday ? '1px solid rgba(232,99,58,0.4)' : '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        boxShadow: studiedToday ? '0 4px 24px rgba(232,99,58,0.2)' : 'none',
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
