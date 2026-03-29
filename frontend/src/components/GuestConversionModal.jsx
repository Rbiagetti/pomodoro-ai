import { useState } from 'react'
import { UserPlus, X, Save } from 'lucide-react'
import API from '../services/api'

export default function GuestConversionModal({ sessionData, onClose, onConverted }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!email || !password) return
    setLoading(true); setError('')
    try {
      const res = await API.post('/auth/register', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_email', res.data.email)
      localStorage.setItem('user_id', res.data.user_id)

      // Salva la sessione guest nel DB
      await API.post('/sessions', sessionData)

      onConverted(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Errore registrazione')
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 backdrop-blur-sm" style={{background:'rgba(0,0,0,0.6)'}} onClick={onClose} />
      <div className="fixed z-50 w-full" style={{
        bottom: 0, left: 0, right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 40px',
      }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.06)', color:'var(--muted)'}}>
          <X size={14} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'rgba(90,158,111,0.15)', border:'1px solid rgba(90,158,111,0.3)'}}>
            <Save size={18} color="var(--success)" />
          </div>
          <div>
            <p className="font-bold" style={{color:'var(--text)'}}>Salva i tuoi progressi</p>
            <p className="text-xs" style={{color:'var(--muted)'}}>Crea un account gratuito per non perdere questa sessione</p>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)'}}
          />

          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm" style={{background:'rgba(232,99,58,0.1)', border:'1px solid rgba(232,99,58,0.2)', color:'var(--accent1)'}}>
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !email || !password}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            style={{background:'linear-gradient(135deg, var(--success), #4a8a5f)', color:'var(--text)'}}
          >
            {loading ? '...' : <><UserPlus size={16} /> Crea account e salva</>}
          </button>

          <button onClick={onClose} className="w-full py-2 text-xs text-center transition" style={{color:'var(--muted)'}}>
            No grazie, perdi i dati
          </button>
        </div>
      </div>
    </>
  )
}
