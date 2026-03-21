import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { endChat } from '../components/PomodoroTimer'

export default function Interrogazione() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { argomento, durata, trascrizione, analisi } = state || {}

  const [chat, setChat] = useState(() => {
    try {
      const saved = sessionStorage.getItem('chat_history')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [risposta, setRisposta] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recording, setRecording] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const mediaRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => { if (chat.length === 0) generaDomanda([]) }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat, loading])

  const generaDomanda = async (history) => {
    setLoading(true)
    try {
      const { data } = await API.post('/audio/question', {
        argomento, trascrizione, analisi, chat_history: history,
      })
      const newHistory = [...history, { role: 'assistant', content: data.domanda }]
      setChat(newHistory)
      // speakText(data.domanda) — solo su richiesta
    } catch (e) {
      alert('Errore AI: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'it-IT'
    utt.rate = 1.0
    utt.pitch = 1.0
    setAiSpeaking(true)
    utt.onend = () => setAiSpeaking(false)
    utt.onerror = () => setAiSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setAiSpeaking(false)
  }

  const invia = async (testo) => {
    const t = testo || risposta
    if (!t.trim()) return
    const newHistory = [...chat, { role: 'user', content: t }]
    sessionStorage.setItem('chat_history', JSON.stringify(newHistory))
    setChat(newHistory)
    setRisposta('')
    await generaDomanda(newHistory)
  }

  const startRecording = async () => {
    try {
      stopSpeaking()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/webm' })
      const chunks = []
      recorder.ondataavailable = e => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks)
        setLoading(true)
        try {
          const formData = new FormData()
          formData.append('file', blob, 'risposta.mp4')
          const { data } = await API.post('/audio/transcribe', formData)
          await invia(data.trascrizione)
        } catch(e) {
          alert('Errore trascrizione: ' + e.message)
          setLoading(false)
        }
      }
      recorder.start()
      mediaRef.current = recorder
      setRecording(true)
    } catch(e) {
      alert('Microfono non disponibile')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const salva = async () => {
    setSaving(true)
    try {
      await API.post('/sessions', {
        argomento, trascrizione, analisi,
        n_domande: chat.filter(m => m.role === 'assistant').length,
        durata_minuti: Number(durata) || 25,
        chat_history: chat,
      })
      sessionStorage.removeItem('chat_history')
      endChat()
      navigate('/')
    } catch (e) {
      alert('Errore salvataggio: ' + (e.response?.data?.detail || e.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="max-w-md w-full mx-auto flex flex-col flex-1">

        {/* Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <h2 className="text-white font-bold text-center" style={{fontFamily:'Georgia, serif'}}>🤖 Interrogazione AI</h2>
          <p className="text-gray-500 text-sm text-center mt-1">{argomento}</p>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakText(msg.content)}
                  className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 hover:text-white transition flex-shrink-0"
                  title="Ascolta"
                >
                  🔊
                </button>
              )}
              <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white'
                  : 'bg-white/8 border border-white/10 text-gray-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex-shrink-0" />
              <div className="bg-white/5 border border-white/10 text-gray-500 rounded-2xl px-4 py-3 text-sm animate-pulse">
                L'AI sta pensando...
              </div>
            </div>
          )}

          {aiSpeaking && (
            <div className="flex justify-center">
              <button
                onClick={stopSpeaking}
                className="text-xs text-blue-400 border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 rounded-full animate-pulse hover:animate-none hover:bg-blue-500/20 transition"
              >
                🔊 AI sta parlando... (clicca per fermare)
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="space-y-3">

          {/* Stato registrazione */}
          {recording && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm animate-pulse">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              Sto registrando... clicca il microfono per fermare
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="La tua risposta..."
              value={risposta}
              onChange={e => setRisposta(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && invia()}
              disabled={recording || loading}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none focus:border-red-500/50 text-sm transition-all disabled:opacity-40"
            />

            {/* Tasto microfono */}
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all disabled:opacity-30 ${
                recording
                  ? 'bg-red-500 border border-red-400 animate-pulse'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              🎙️
            </button>

            {/* Tasto invia testo */}
            <button
              onClick={() => invia()}
              disabled={loading || !risposta.trim() || recording}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold flex items-center justify-center transition disabled:opacity-30"
            >
              ➤
            </button>
          </div>

          <button
            onClick={salva}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm hover:bg-emerald-500/30 transition disabled:opacity-50"
          >
            {saving ? '💾 Salvataggio...' : '✅ Termina e salva sessione'}
          </button>
        </div>
      </div>
    </div>
  )
}
