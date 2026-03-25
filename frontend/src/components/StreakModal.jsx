import { useMemo, useEffect, useState, useRef } from 'react'
import Flame from './Flame'

function calcAllStreaks(sessioni) {
  const dates = [...new Set(
    sessioni.map(s => s.study_date || s.created_at?.split('T')[0])
  )].filter(Boolean).sort().reverse()

  if (!dates.length) return { current: 0, best: 0, streaks: [], studiedDates: new Set() }

  const studiedDates = new Set(dates)
  const today = new Date().toISOString().split('T')[0]

  const streaks = []
  let i = 0
  while (i < dates.length) {
    let count = 1
    let start = dates[i]
    let end = dates[i]
    while (i + 1 < dates.length) {
      const curr = new Date(dates[i])
      const next = new Date(dates[i + 1])
      if ((curr - next) / 86400000 === 1) { count++; end = dates[i + 1]; i++ }
      else break
    }
    streaks.push({ start: end, end: start, days: count })
    i++
  }

  let current = 0
  let expected = today
  for (const d of dates) {
    if (d === expected) {
      current++
      const dt = new Date(expected)
      dt.setDate(dt.getDate() - 1)
      expected = dt.toISOString().split('T')[0]
    } else if (d < expected) break
  }

  const best = Math.max(...streaks.map(s => s.days), 0)
  return { current, best, streaks, studiedDates }
}

function useMonthRange(studiedDates) {
  return useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    if (studiedDates.size === 0) {
      return [{ year: currentYear, month: currentMonth }]
    }

    const sorted = [...studiedDates].sort()
    const oldest = new Date(sorted[0])
    const months = []
    let y = oldest.getFullYear()
    let m = oldest.getMonth()

    while (y < currentYear || (y === currentYear && m <= currentMonth)) {
      months.push({ year: y, month: m })
      m++
      if (m > 11) { m = 0; y++ }
    }

    return months
  }, [studiedDates])
}

function CalendarMonth({ year, month, studiedDates, isCurrentMonth }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]
  const pad = (firstDay + 6) % 7
  const days = []
  for (let i = 0; i < pad; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    days.push({ d, dateStr, studied: studiedDates.has(dateStr), isToday: dateStr === today })
  }
  const monthName = new Date(year, month).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  return (
    <div className="mb-4" ref={isCurrentMonth ? currentMonthRef : null}>
      <p className="text-xs font-semibold mb-2 capitalize" style={{color:'var(--muted)'}}>{monthName}</p>
      <div className="grid grid-cols-7 gap-1">
        {['L','M','M','G','V','S','D'].map((d,i) => (
          <div key={i} className="text-center" style={{color:'var(--muted)', fontSize:'10px'}}>{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} className="aspect-square rounded-lg flex items-center justify-center"
            style={{
              fontSize:'11px',
              background: day?.studied ? 'rgba(232,99,58,0.25)' : day ? 'rgba(255,255,255,0.03)' : 'transparent',
              border: day?.isToday ? '1px solid rgba(232,99,58,0.6)' : '1px solid transparent',
              color: day?.studied ? '#ff6b3d' : 'var(--muted)',
              fontWeight: day?.studied ? '700' : '400',
            }}>
            {day?.d || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

const currentMonthRef = { current: null }

export default function StreakModal({ sessioni, currentStreak, onClose, originRect }) {
  const { best, streaks, studiedDates } = useMemo(() => calcAllStreaks(sessioni), [sessioni])
  const current = currentStreak ?? 0
  const [visible, setVisible] = useState(false)

  const isMobile = window.innerWidth < 640

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  const now = new Date()
  const months = useMonthRange(studiedDates)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (currentMonthRef.current) {
      currentMonthRef.current.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [visible])

  // Centro icona fiamma in coordinate viewport
  const flameX = originRect ? originRect.left + originRect.width / 2 : window.innerWidth - 60
  const flameY = originRect ? originRect.top + originRect.height / 2 : 40

  // Dimensioni e posizione panel calcolate una volta sola
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Panel: si apre sopra se la sorgente è nella metà bassa dello schermo
  const sourceInBottom = flameY > vh / 2
  const panelWidth  = Math.min(400, vw - 16)
  const panelHeight = Math.min(vh * 0.85, vh - 80)
  const panelLeft   = Math.min(vw - panelWidth - 8, Math.max(8, flameX - panelWidth / 2))
  const panelTop    = sourceInBottom
    ? Math.max(8, flameY - panelHeight - 8)
    : (originRect ? originRect.bottom + 8 : 56)
  const panelRadius = isMobile ? '24px'                         : '20px'

  const panelStyle = {
    position: 'fixed',
    top: panelTop,
    left: panelLeft,
    width: panelWidth,
    maxHeight: panelHeight,
    borderRadius: panelRadius,
  }

  // Transform origin: coordinate della fiamma relative al top-left del panel
  const tfOriginX = Math.round(flameX - panelLeft)
  const tfOriginY = Math.round(flameY - panelTop)
  const tfOrigin  = `${tfOriginX}px ${tfOriginY}px`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
          backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
          transition: 'all 0.28s ease',
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        style={{
          ...panelStyle,
          zIndex: 51,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          transformOrigin: tfOrigin,
          transform: visible ? 'scale(1)' : 'scale(0.08)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.32s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header fisso */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame size={28} intensity={Math.min(2, current / 3 + 0.5)} />
              <div>
                <div className="text-xl font-bold" style={{color:'var(--text)', fontFamily:"'Space Mono', monospace"}}>
                  {current} {current === 1 ? 'giorno' : 'giorni'}
                </div>
                <div className="text-xs" style={{color:'var(--muted)'}}>streak attuale</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{background:'rgba(255,255,255,0.06)', color:'var(--muted)', fontSize:'16px', flexShrink:0}}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Corpo scrollabile */}
        <div style={{padding: '20px 24px 40px', overflowY: 'auto', flex: 1}}>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl p-4" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
              <div className="text-xl font-bold" style={{color:'var(--accent1)', fontFamily:"'Space Mono', monospace"}}>{best}</div>
              <div className="text-xs mt-1" style={{color:'var(--muted)'}}>record massimo</div>
            </div>
            <div className="rounded-2xl p-4" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
              <div className="text-xl font-bold" style={{color:'var(--accent2)', fontFamily:"'Space Mono', monospace"}}>{studiedDates.size}</div>
              <div className="text-xs mt-1" style={{color:'var(--muted)'}}>giorni totali</div>
            </div>
          </div>

          {/* Calendario */}
          <div className="mb-6" ref={scrollRef}>
            {months.map(({ year, month }) => {
              const isCurrent = year === now.getFullYear() && month === now.getMonth()
              return (
                <CalendarMonth
                  key={`${year}-${month}`}
                  year={year} month={month}
                  studiedDates={studiedDates}
                  isCurrentMonth={isCurrent}
                />
              )
            })}
          </div>

          {/* Streak storici */}
          {streaks.length > 1 && (
            <div>
              <p className="text-xs font-semibold mb-3" style={{color:'var(--muted)'}}>STREAK PRECEDENTI</p>
              <div className="space-y-2">
                {streaks.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
                    <span className="text-xs" style={{color:'var(--muted)'}}>
                      {new Date(s.start).toLocaleDateString('it-IT', {day:'numeric', month:'short'})} →{' '}
                      {new Date(s.end).toLocaleDateString('it-IT', {day:'numeric', month:'short'})}
                    </span>
                    <span className="text-sm font-bold" style={{color:'var(--accent1)', fontFamily:"'Space Mono', monospace"}}>
                      {s.days}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>{/* fine corpo scrollabile */}
      </div>
    </>
  )
}
