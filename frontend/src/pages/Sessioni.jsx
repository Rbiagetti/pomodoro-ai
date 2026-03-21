import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function QualityStars({ n_domande, durata_minuti }) {
  const score = Math.min(5, Math.floor((n_domande / 5) + (durata_minuti / 25)))
  return (
    <span className="text-yellow-400 text-sm">
      {'⭐'.repeat(score)}{'☆'.repeat(5 - score)}
    </span>
  )
}

function SessioneDettaglio({ sessione, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">{sessione.argomento}</h3>
            <p className="text-gray-400 text-sm">{new Date(sessione.created_at).toLocaleDateString('it-IT')} · {sessione.durata_minuti} min</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">🧠 Analisi AI</h4>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{sessione.analisi}</p>
          </div>

          {sessione.trascrizione && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-blue-400 font-semibold mb-2">📝 Trascrizione</h4>
              <p className="text-gray-400 text-sm whitespace-pre-wrap">{sessione.trascrizione}</p>
            </div>
          )}

          {sessione.chat_history?.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-green-400 font-semibold mb-3">❓ Domande AI ({sessione.n_domande})</h4>
              <div className="space-y-2">
                {sessione.chat_history.map((msg, i) => (
                  <div key={i} className={`text-sm px-3 py-2 rounded-lg ${
                    msg.role === 'assistant' ? 'bg-gray-700 text-gray-200' : 'bg-gray-600 text-gray-300 ml-4'
                  }`}>
                    <span className="text-xs text-gray-500 mr-2">{msg.role === 'assistant' ? '🤖' : '👤'}</span>
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessione.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sessione.tags.map(tag => (
                <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Sessioni() {
  const navigate = useNavigate()
  const [sessioni, setSessioni] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchSessioni() }, [])

  const fetchSessioni = async (q = '') => {
    setLoading(true)
    try {
      const params = q ? { search: q } : {}
      const { data } = await API.get('/sessions', { params })
      setSessioni(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchSessioni(e.target.value)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Eliminare questa sessione?')) return
    setDeleting(id)
    try {
      await API.delete(`/sessions/${id}`)
      setSessioni(s => s.filter(x => x.id !== id))
    } catch (e) {
      alert('Errore eliminazione')
    } finally {
      setDeleting(null)
    }
  }

  const totaleMinuti = sessioni.reduce((acc, s) => acc + s.durata_minuti, 0)
  const totaleDomande = sessioni.reduce((acc, s) => acc + s.n_domande, 0)

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">📚 Le mie sessioni</h2>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">
            ← Torna
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Sessioni', value: sessioni.length, icon: '🍅' },
            { label: 'Minuti', value: totaleMinuti, icon: '⏱️' },
            { label: 'Domande', value: totaleDomande, icon: '❓' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 rounded-xl p-3 text-center">
              <div className="text-xl">{s.icon}</div>
              <div className="text-white font-bold text-lg">{s.value}</div>
              <div className="text-gray-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Cerca per argomento..."
          value={search}
          onChange={handleSearch}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />

        {/* Lista */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Caricamento...</div>
        ) : sessioni.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-3">🍅</div>
            <p>Nessuna sessione ancora.</p>
            <button onClick={() => navigate('/')} className="mt-4 text-red-400 hover:text-red-300">
              Inizia a studiare →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessioni.map(s => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{s.argomento}</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(s.created_at).toLocaleDateString('it-IT')} · {s.durata_minuti} min · {s.n_domande} domande
                    </p>
                    <div className="mt-2">
                      <QualityStars n_domande={s.n_domande} durata_minuti={s.durata_minuti} />
                    </div>
                  </div>
                  <button
                    onClick={e => handleDelete(s.id, e)}
                    disabled={deleting === s.id}
                    className="text-gray-600 hover:text-red-400 transition ml-2 text-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <SessioneDettaglio sessione={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
