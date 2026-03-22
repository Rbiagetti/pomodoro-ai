export default function Flame({ size = 24, intensity = 1 }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes flicker1 {
          0%,100% { transform: scaleY(1) scaleX(1); }
          25% { transform: scaleY(1.08) scaleX(0.96); }
          50% { transform: scaleY(0.95) scaleX(1.04); }
          75% { transform: scaleY(1.05) scaleX(0.97); }
        }
        @keyframes flicker2 {
          0%,100% { transform: scaleY(1) scaleX(1); }
          30% { transform: scaleY(1.12) scaleX(0.94); }
          60% { transform: scaleY(0.92) scaleX(1.06); }
        }
        @keyframes glow {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .fl1 { transform-origin: 12px 22px; animation: flicker1 1.4s ease-in-out infinite; }
        .fl2 { transform-origin: 12px 22px; animation: flicker2 1.1s ease-in-out infinite 0.2s; }
        .fl3 { transform-origin: 12px 22px; animation: flicker1 1.7s ease-in-out infinite 0.5s; }
        .glw { animation: glow 1.4s ease-in-out infinite; }
      `}</style>

      {/* Glow base */}
      <ellipse className="glw" cx="12" cy="20" rx="6" ry="2.5"
        fill={`rgba(232,99,58,${0.25 * intensity})`} />

      {/* Outer flame */}
      <path className="fl1"
        d="M12 2C12 2 7 7 7 13c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2-1.5-3.5-1.5-3.5S14.5 11 13 11c0 0 1-2-1-9z"
        fill="url(#og)" />

      {/* Mid flame */}
      <path className="fl2"
        d="M12 6C12 6 9 10 9 13.5c0 1.7 1.3 3 3 3s3-1.3 3-3c0-1.2-0.8-2-0.8-2S13.5 12 12.5 12c0 0 0.5-1.5-0.5-6z"
        fill="url(#my)" />

      {/* Inner core */}
      <path className="fl3"
        d="M12 10C12 10 10.5 12 10.5 13.8c0 0.8 0.7 1.5 1.5 1.5s1.5-0.7 1.5-1.5c0-0.6-0.5-1.2-0.5-1.2S12.8 13 12.3 13c0 0 0.2-0.8-0.3-3z"
        fill="#fff5e0" opacity="0.9" />

      <defs>
        <linearGradient id="og" x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff3d00" />
          <stop offset="50%" stopColor="#ff6b3d" />
          <stop offset="100%" stopColor="#f0943a" />
        </linearGradient>
        <linearGradient id="my" x1="12" y1="6" x2="12" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffcc02" />
          <stop offset="100%" stopColor="#ff8c00" />
        </linearGradient>
      </defs>
    </svg>
  )
}
