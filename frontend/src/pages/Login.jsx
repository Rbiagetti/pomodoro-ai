import { useState } from 'react'
import API from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const res = await API.post(endpoint, { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_email', res.data.email)
      onLogin(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/15 blur-[130px]" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[100px]" />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 via-orange-400 to-pink-500 items-center justify-center text-4xl mb-5 shadow-2xl shadow-red-500/40">
            🍅
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight" style={{fontFamily:'Georgia, serif'}}>
            Pomodoro AI
          </h1>
          <p className="text-gray-500 text-sm mt-2">Studia meglio con l'AI socratica</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-7 shadow-2xl backdrop-blur-xl space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 text-white placeholder-gray-600 rounded-2xl px-5 py-4 outline-none border border-white/10 focus:border-red-500/50 transition-all text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-white/5 text-white placeholder-gray-600 rounded-2xl px-5 py-4 outline-none border border-white/10 focus:border-red-500/50 transition-all text-sm"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm tracking-wide transition-all duration-300 disabled:opacity-30 relative overflow-hidden group"
            style={{background:'linear-gradient(135deg, #ef4444, #f97316, #ec4899)'}}
          >
            <span className="relative z-10">
              {loading ? '...' : isRegister ? '📝 Registrati' : '🔑 Accedi'}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="w-full text-gray-600 hover:text-gray-400 text-xs transition py-1"
          >
            {isRegister ? 'Hai già un account? Accedi →' : 'Non hai un account? Registrati →'}
          </button>
        </div>
      </div>
    </div>
  )
}
