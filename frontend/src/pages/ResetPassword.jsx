import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase mette la session nell'hash dopo il click sul link email
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // sessione attiva, possiamo aggiornare la password
      }
    })
  }, [])

  const handleReset = async () => {
    if (password !== confirm) { setError('Le password non coincidono'); return }
    if (password.length < 6) { setError('Minimo 6 caratteri'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (e) {
      setError(e.message || 'Errore aggiornamento password')
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
          <p style={{color:'var(--muted)', fontSize:'14px'}}>Nuova password</p>
        </div>

        <div className="rounded-2xl p-7 space-y-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          {!done ? (
            <>
              <input
                type="password" placeholder="Nuova password" value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
                style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
              />
              <input
                type="password" placeholder="Conferma password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all"
                style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
              />

              {error && (
                <div className="rounded-2xl px-4 py-3 text-sm" style={{background:'rgba(232,99,58,0.1)', border:'1px solid rgba(232,99,58,0.2)', color:'var(--accent1)'}}>
                  {error}
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={loading || !password || !confirm}
                className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)'}}
              >
                {loading ? '...' : <><KeyRound size={16} /> Aggiorna password</>}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="text-4xl">✅</div>
              <p className="font-semibold" style={{color:'var(--text)'}}>Password aggiornata!</p>
              <p className="text-xs" style={{color:'var(--muted)'}}>Verrai reindirizzato al login tra pochi secondi...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
