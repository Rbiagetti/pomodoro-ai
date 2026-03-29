import { useState } from 'react'
import { LogIn, UserPlus, Mail, ArrowLeft } from 'lucide-react'
import API from '../services/api'
import { supabase } from '../services/supabase'

export default function Login({ onLogin, onGuestLogin }) {
  const [view, setView] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const reset = () => { setEmail(''); setPassword(''); setError('') }

  const handleLogin = async () => {
    setLoading(true); setError('')
    try {
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_email', res.data.email)
      localStorage.setItem('user_id', res.data.user_id)
      onLogin(res.data)
    } catch (e) { setError(e.response?.data?.detail || 'Errore di connessione') }
    finally { setLoading(false) }
  }

  const handleRegister = async () => {
    setLoading(true); setError('')
    try {
      const res = await API.post('/auth/register', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_email', res.data.email)
      localStorage.setItem('user_id', res.data.user_id)
      onLogin(res.data)
    } catch (e) { setError(e.response?.data?.detail || 'Errore di connessione') }
    finally { setLoading(false) }
  }

  const handleForgot = async () => {
    setForgotLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setForgotSent(true)
    } catch (e) { setError(e.message || 'Errore invio email') }
    finally { setForgotLoading(false) }
  }

  const Bg = () => (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{background:'rgba(232,99,58,0.08)'}} />
      <div className="absolute bottom-[-20%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{background:'rgba(212,135,58,0.06)'}} />
    </div>
  )

  const Logo = () => (
    <div className="text-center mb-10">
      <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-5 shadow-2xl overflow-hidden" style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))'}}>
        <img src="/logo.png" alt="Pomodoro AI" className="w-14 h-14 object-contain" />
      </div>
      <h1 className="text-4xl font-bold mb-2" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>Pomodoro AI</h1>
      <p style={{color:'var(--muted)', fontSize:'14px'}}>Studia meglio con l'AI socratica</p>
    </div>
  )

  const ErrorBox = () => error ? (
    <div className="rounded-2xl px-4 py-3 text-sm" style={{background:'rgba(232,99,58,0.1)', border:'1px solid rgba(232,99,58,0.2)', color:'var(--accent1)'}}>
      {error}
    </div>
  ) : null

  // ── LOGIN ──────────────────────────────────────────────
  if (view === 'login') return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{background:'var(--bg)'}}>
      <Bg />
      <div className="w-full max-w-sm relative z-10">
        <Logo />
        <div className="rounded-2xl p-7 space-y-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}} />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}} />
          <ErrorBox />
          <button onClick={handleLogin} disabled={loading || !email || !password}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)'}}>
            {loading ? '...' : <><LogIn size={16} /> Accedi</>}
          </button>
          <button onClick={() => { setShowForgot: setView('forgot'); setForgotEmail(email); setError('') }}
            className="w-full py-1 text-xs text-center transition" style={{color:'var(--muted)'}}>
            Password dimenticata?
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <button onClick={() => { reset(); setView('register') }}
            className="w-full py-3 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', color:'var(--text2)'}}>
            <UserPlus size={15} /> Crea un account
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{background:'var(--border)'}} />
            <span className="text-xs" style={{color:'var(--muted)'}}>oppure</span>
            <div className="flex-1 h-px" style={{background:'var(--border)'}} />
          </div>
          <button onClick={onGuestLogin}
            className="w-full py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
            style={{background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.12)', color:'var(--muted)'}}>
            Prova senza account
          </button>
        </div>
      </div>
    </div>
  )

  // ── REGISTER ──────────────────────────────────────────
  if (view === 'register') return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{background:'var(--bg)'}}>
      <Bg />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-5 shadow-2xl overflow-hidden" style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))'}}>
            <img src="/logo.png" alt="Pomodoro AI" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>Crea account</h1>
          <p style={{color:'var(--muted)', fontSize:'14px'}}>Inizia a tracciare il tuo studio</p>
        </div>
        <div className="rounded-2xl p-7 space-y-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}} />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}} />
          <ErrorBox />
          <button onClick={handleRegister} disabled={loading || !email || !password}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)'}}>
            {loading ? '...' : <><UserPlus size={16} /> Registrati</>}
          </button>
        </div>
        <button onClick={() => { reset(); setView('login') }}
          className="mt-4 w-full py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
          style={{color:'var(--muted)'}}>
          <ArrowLeft size={14} /> Torna al login
        </button>
      </div>
    </div>
  )

  // ── FORGOT ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{background:'var(--bg)'}}>
      <Bg />
      <div className="w-full max-w-sm relative z-10">
        <Logo />
        <div className="rounded-2xl p-7 space-y-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          {!forgotSent ? (
            <>
              <div className="text-center mb-2">
                <p className="font-semibold mb-1" style={{color:'var(--text)'}}>Reset password</p>
                <p className="text-xs" style={{color:'var(--muted)'}}>Ti mandiamo un link via email</p>
              </div>
              <input type="email" placeholder="La tua email" value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleForgot()}
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
                style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}} />
              <ErrorBox />
              <button onClick={handleForgot} disabled={forgotLoading || !forgotEmail}
                className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)'}}>
                {forgotLoading ? '...' : <><Mail size={16} /> Invia link</>}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <Mail size={36} color="var(--accent2)" className="mx-auto" />
              <p className="font-semibold" style={{color:'var(--text)'}}>Email inviata!</p>
              <p className="text-xs" style={{color:'var(--muted)'}}>
                Controlla <span style={{color:'var(--accent2)'}}>{forgotEmail}</span> e clicca il link.
              </p>
            </div>
          )}
        </div>
        <button onClick={() => { reset(); setView('login') }}
          className="mt-4 w-full py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
          style={{color:'var(--muted)'}}>
          <ArrowLeft size={14} /> Torna al login
        </button>
      </div>
    </div>
  )
}
