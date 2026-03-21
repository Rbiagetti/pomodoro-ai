import { useNavigate } from 'react-router-dom'

export default function Error({ message = 'Qualcosa è andato storto' }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:'var(--bg)'}}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{background:'rgba(232,99,58,0.06)'}} />
      </div>

      <div className="w-full max-w-sm text-center relative z-10">
        <div className="text-6xl mb-6">🍅</div>

        <h1 className="text-3xl font-bold mb-3" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>
          Ops!
        </h1>

        <p className="text-sm mb-8" style={{color:'var(--muted)'}}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
            style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)'}}
          >
            🔄 Ricarica
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)', border:'none'}}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  )
}
