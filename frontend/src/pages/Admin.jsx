import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

export default function Admin() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/sessions/admin/all')
      setSessions(data)
    } catch(e) {
      setError(e.response?.data?.detail || 'Non autorizzato')
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Eliminare questa sessione?')) return
    try {
      await API.delete(`/sessions/admin/${id}`)
      setSessions(s => s.filter(x => x.id !== id))
    } catch(e) {
      alert('Errore: ' + e.message)
    }
  }

  const filtered = sessions.filter(s =>
    s.argomento?.toLowerCase().includes(search.toLowerCase()) ||
    s.user_id?.toLowerCase().includes(search.toLowerCase())
  )

  const totalDomande = sessions.reduce((a, s) => a + s.n_domande, 0)
  const totalMinuti = sessions.reduce((a, s) => a + s.durata_minuti, 0)
  const uniqueUsers = [...new Set(sessions.map(s => s.user_id))].length

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🚫</div>
        <p className="text-red-400 font-bold">{error}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-gray-500 hover:text-white text-sm">← Torna alla home</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{fontFamily:'Georgia, serif'}}>🛡️ Admin Panel</h2>
            <p className="text-gray-500 text-sm mt-1">Tutte le sessioni di tutti gli utenti</p>
          </div>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm transition">← Home</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Sessioni', value: sessions.length, icon: '🍅' },
            { label: 'Utenti', value: uniqueUsers, icon: '👥' },
            { label: 'Minuti', value: totalMinuti, icon: '⏱️' },
            { label: 'Domande', value: totalDomande, icon: '❓' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl">{s.icon}</div>
              <div className="text-white font-bold">{s.value}</div>
              <div className="text-gray-600 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Cerca per argomento o user_id..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none focus:border-red-500/50 text-sm mb-4 transition"
        />

        {loading ? (
          <div className="text-center text-gray-500 py-12">Caricamento...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <div
                key={s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{s.argomento}</h3>
                    <p className="text-gray-600 text-xs mt-1 font-mono">{s.user_id?.slice(0,16)}...</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(s.created_at).toLocaleDateString('it-IT')} · {s.durata_minuti}min · {s.n_domande} domande
                    </p>
                  </div>
                  <button
                    onClick={e => deleteSession(s.id, e)}
                    className="text-gray-700 hover:text-red-400 transition text-lg ml-2"
                  >
                    🗑️
                  </button>
                </div>

                {selected?.id === s.id && (
                  <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                    {s.analisi && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-red-400 text-xs font-semibold mb-1">🧠 Analisi AI</p>
                        <p className="text-gray-400 text-xs whitespace-pre-wrap">{s.analisi}</p>
                      </div>
                    )}
                    {s.trascrizione && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-blue-400 text-xs font-semibold mb-1">📝 Trascrizione</p>
                        <p className="text-gray-500 text-xs whitespace-pre-wrap">{s.trascrizione}</p>
                      </div>
                    )}
                    {s.chat_history?.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-green-400 text-xs font-semibold mb-2">💬 Chat ({s.chat_history.length} messaggi)</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {s.chat_history.map((m, i) => (
                            <p key={i} className={`text-xs ${m.role === 'assistant' ? 'text-gray-300' : 'text-gray-500'}`}>
                              <span className="mr-1">{m.role === 'assistant' ? '🤖' : '👤'}</span>
                              {m.content}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
