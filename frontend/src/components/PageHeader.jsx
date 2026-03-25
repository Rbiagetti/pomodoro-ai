import { useEffect, useState } from 'react'

export default function PageHeader({ icon: Icon, title, subtitle, color = 'var(--accent1)' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="text-center mb-8"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-16px)',
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)',
      }}
    >
      {Icon && (
        <div
          className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 shadow-lg"
          style={{background:`${color}18`, border:`1px solid ${color}30`}}
        >
          <Icon size={26} color={color} />
        </div>
      )}
      <h2
        className="text-3xl font-bold mb-1"
        style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{color:'var(--muted)', fontSize:'14px'}}>{subtitle}</p>
      )}
    </div>
  )
}
