import { useNavigate, useRouteError } from 'react-router-dom'

export default function Error({ message }) {
  const navigate = useNavigate()
  const routeError = useRouteError()
  const errorMessage = message || routeError?.message || 'Qualcosa è andato storto'

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:'var(--bg)'}}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{background:'rgba(232,99,58,0.06)'}} />
      </div>

      <div className="w-full max-w-sm text-center relative z-10">

        <div className="text-6xl mb-6">🍅</div>

        <h1 className="text-3xl font-bold mb-3" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>
          Ops, qualcosa è andato storto
        </h1>

        <p className="text-sm mb-2" style={{color:'var(--muted)'}}>
          {errorMessage}
        </p>

        <p className="text-xs mb-8" style={{color:'var(--muted)', opacity:0.6}}>
          Se il problema persiste, prova a ricaricare la pagina.
        </p>

        <div className="rounded-2xl p-4 mb-8 text-left" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <p className="text-xs font-mono" style={{color:'var(--muted)'}}>
            {routeError?.status && <span style={{color:'var(--accent1)'}}>Error {routeError.status}: </span>}
            {errorMessage}
          </p>
        </div>

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
            🏠 Torna alla home
          </button>
        </div>
      </div>
    </div>
  )
}
