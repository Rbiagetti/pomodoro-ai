import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import API from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const res = await API.post(isRegister ? '/auth/register' : '/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_email', res.data.email)
      localStorage.setItem('user_id', res.data.user_id)
      onLogin(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Errore di connessione')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{background:'var(--bg)'}}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{background:'rgba(232,99,58,0.08)'}} />
        <div className="absolute bottom-[-20%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{background:'rgba(212,135,58,0.06)'}} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-5 shadow-2xl overflow-hidden" style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))'}}>
            <img src="/logo.png" alt="Pomodoro AI" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>
            Pomodoro AI
          </h1>
          <p style={{color:'var(--muted)', fontSize:'14px'}}>Studia meglio con l'AI socratica</p>
        </div>

        <div className="rounded-2xl p-7 space-y-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
          />

          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm" style={{background:'rgba(232,99,58,0.1)', border:'1px solid rgba(232,99,58,0.2)', color:'var(--accent1)'}}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)'}}
          >
            {loading ? '...' : isRegister ? <><UserPlus size={16} /> Registrati</> : <><LogIn size={16} /> Accedi</>}
          </button>

          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="w-full py-1 text-xs transition"
            style={{color:'var(--muted)'}}
          >
            {isRegister ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </button>
        </div>
      </div>
    </div>
  )
}
