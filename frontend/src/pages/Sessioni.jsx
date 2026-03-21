import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function Stars({ n_domande, durata_minuti }) {
  const score = Math.min(5, Math.floor((n_domande / 5) + (durata_minuti / 25)))
  return <span style={{color:'var(--accent3)', fontSize:'13px'}}>{'⭐'.repeat(score)}{'☆'.repeat(5 - score)}</span>
}

function Dettaglio({ sessione, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{background:'rgba(0,0,0,0.7)'}} onClick={onClose}>
      <div className="rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" style={{background:'var(--surface)', border:'1px solid var(--border)'}} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif"}}>{sessione.argomento}</h3>
            <p className="text-sm mt-1" style={{color:'var(--muted)'}}>{new Date(sessione.created_at).toLocaleDateString('it-IT')} · {sessione.durata_minuti} min</p>
          </div>
          <button onClick={onClose} className="text-xl transition" style={{color:'var(--muted)'}}>✕</button>
        </div>

        <div className="space-y-3">
          {sessione.analisi && (
            <div className="rounded-2xl p-4" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
              <h4 className="font-semibold mb-2 text-sm" style={{color:'var(--accent1)'}}>🧠 Analisi AI</h4>
              <p className="text-sm whitespace-pre-wrap" style={{color:'var(--text2)'}}>{sessione.analisi}</p>
            </div>
          )}
          {sessione.trascrizione && (
            <div className="rounded-2xl p-4" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
              <h4 className="font-semibold mb-2 text-sm" style={{color:'var(--accent2)'}}>📝 Trascrizione</h4>
              <p className="text-sm whitespace-pre-wrap" style={{color:'var(--muted)'}}>{sessione.trascrizione}</p>
            </div>
          )}
          {sessione.chat_history?.length > 0 && (
            <div className="rounded-2xl p-4" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
              <h4 className="font-semibold mb-3 text-sm" style={{color:'var(--success)'}}>❓ Chat ({sessione.n_domande} domande)</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sessione.chat_history.map((m, i) => (
                  <p key={i} className="text-xs" style={{color: m.role === 'assistant' ? 'var(--text2)' : 'var(--muted)'}}>
                    <span className="mr-1">{m.role === 'assistant' ? '🤖' : '👤'}</span>{m.content}
                  </p>
                ))}
              </div>
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

  useEffect(() => { fetchSessioni() }, [])

  const fetchSessioni = async (q = '') => {
    setLoading(true)
    try {
      const { data } = await API.get('/sessions', { params: q ? { search: q } : {} })
      setSessioni(data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Eliminare questa sessione?')) return
    try {
      await API.delete(`/sessions/${id}`)
      setSessioni(s => s.filter(x => x.id !== id))
    } catch(e) { alert('Errore eliminazione') }
  }

  const totMin = sessioni.reduce((a, s) => a + s.durata_minuti, 0)
  const totDom = sessioni.reduce((a, s) => a + s.n_domande, 0)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>📚 Le mie sessioni</h2>
          <button onClick={() => navigate('/')} className="text-sm transition" style={{color:'var(--muted)'}}>← Torna</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Sessioni', value: sessioni.length, icon: '🍅' },
            { label: 'Minuti', value: totMin, icon: '⏱️' },
            { label: 'Domande', value: totDom, icon: '❓' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
              <div className="text-xl">{s.icon}</div>
              <div className="font-bold text-lg" style={{color:'var(--text)', fontFamily:"'Space Mono', monospace"}}>{s.value}</div>
              <div className="text-xs" style={{color:'var(--muted)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text" placeholder="🔍 Cerca per argomento..."
          value={search}
          onChange={e => { setSearch(e.target.value); fetchSessioni(e.target.value) }}
          className="w-full rounded-2xl px-4 py-3 outline-none text-sm mb-4 transition"
          style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)'}}
        />

        {loading ? (
          <div className="text-center py-12" style={{color:'var(--muted)'}}>Caricamento...</div>
        ) : sessioni.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🍅</div>
            <p style={{color:'var(--muted)'}}>Nessuna sessione ancora.</p>
            <button onClick={() => navigate('/')} className="mt-4 text-sm transition" style={{color:'var(--accent1)'}}>Inizia a studiare →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessioni.map(s => (
              <div key={s.id} onClick={() => setSelected(s)}
                className="rounded-2xl p-4 cursor-pointer transition-all"
                style={{background:'var(--surface)', border:'1px solid var(--border)'}}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{color:'var(--text)'}}>{s.argomento}</h3>
                    <p className="text-xs mt-1" style={{color:'var(--muted)'}}>
                      {new Date(s.created_at).toLocaleDateString('it-IT')} · {s.durata_minuti} min · {s.n_domande} domande
                    </p>
                    <div className="mt-2"><Stars n_domande={s.n_domande} durata_minuti={s.durata_minuti} /></div>
                  </div>
                  <button onClick={e => handleDelete(s.id, e)} className="text-lg ml-2 transition" style={{color:'var(--border2)'}}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && <Dettaglio sessione={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
