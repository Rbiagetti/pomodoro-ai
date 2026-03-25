import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Send, Volume2, Save, CheckCircle, Square } from 'lucide-react'
import API, { setRetryCallback } from '../services/api'
import { endChat } from '../components/PomodoroTimer'

export default function Interrogazione() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { argomento, durata, trascrizione, analisi } = state || {}

  const [chat, setChat] = useState(() => {
    try { const s = sessionStorage.getItem('chat_history'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [risposta, setRisposta] = useState('')
  const [loading, setLoading] = useState(false)
  const [retryMsg, setRetryMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [recording, setRecording] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const mediaRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (mediaRef.current?.state !== 'inactive') {
        mediaRef.current?.stop()
      }
    }
  }, [])
  const chatEndRef = useRef(null)

  useEffect(() => {
    setRetryCallback(msg => setRetryMsg(msg))
    return () => setRetryCallback(null)
  }, [])
  useEffect(() => { if (chat.length === 0) generaDomanda([]) }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chat, loading])

  const generaDomanda = async (history) => {
    setLoading(true)
    try {
      const { data } = await API.post('/audio/question', { argomento, trascrizione, analisi, chat_history: history })
      const newH = [...history, { role: 'assistant', content: data.domanda }]
      setChat(newH)
      sessionStorage.setItem('chat_history', JSON.stringify(newH))
    } catch (e) { alert('Errore AI: ' + (e.response?.data?.detail || e.message)) }
    finally { setLoading(false) }
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'it-IT'; utt.rate = 1.0
    setAiSpeaking(true)
    utt.onend = () => setAiSpeaking(false)
    utt.onerror = () => setAiSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  const invia = async (testo) => {
    const t = testo || risposta
    if (!t.trim()) return
    const newH = [...chat, { role: 'user', content: t }]
    setChat(newH)
    sessionStorage.setItem('chat_history', JSON.stringify(newH))
    setRisposta('')
    await generaDomanda(newH)
  }

  const startRecording = async () => {
    try {
      window.speechSynthesis?.cancel()
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
      const mimeType = types.find(t => MediaRecorder.isTypeSupported(t)) || 'audio/mp4'
      let recorder
      try { recorder = new MediaRecorder(stream, { mimeType }) } catch(e) { recorder = new MediaRecorder(stream) }
      const chunks = []
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType })
        setLoading(true)
        try {
          const formData = new FormData()
          const ext = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm'
          formData.append('file', blob, 'risposta.' + ext)
          const { data } = await API.post('/audio/transcribe', formData)
          await invia(data.trascrizione)
        } catch(e) { alert('Errore trascrizione: ' + e.message); setLoading(false) }
      }
      streamRef.current = stream
      recorder.start(); mediaRef.current = recorder; setRecording(true)
    } catch(e) { alert('Microfono non disponibile') }
  }

  const stopRecording = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
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
      window.dispatchEvent(new Event('session-saved'))
      endChat(); navigate('/')
    } catch (e) { alert('Errore: ' + (e.response?.data?.detail || e.message)) }
    finally { setSaving(false) }
  }

  return (
    <>
      {/* Header fisso sotto topbar */}
      <div className="fixed left-0 right-0 z-20 px-4 pt-2 pb-2" style={{top:'64px', background:'var(--bg)'}}>
        <div className="max-w-md mx-auto rounded-2xl p-3" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          <p className="text-sm text-center font-bold" style={{color:'var(--muted)'}}>{argomento}</p>
        </div>
      </div>

      {/* Chat scrollabile */}
      <div className="fixed left-0 right-0 overflow-y-auto px-4" style={{top:'120px', bottom:'150px'}}>
        <div className="max-w-md mx-auto space-y-3">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {msg.role === 'assistant' && (
                <button onClick={() => speakText(msg.content)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition flex-shrink-0"
                  style={{background:'var(--surface)', border:'1px solid var(--border)'}}
                >
                  <Volume2 size={12} color="var(--muted)" />
                </button>
              )}
              <div className="max-w-xs rounded-2xl px-4 py-3 text-sm"
                style={msg.role === 'user'
                  ? {background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)'}
                  : {background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)'}
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 rounded-full flex-shrink-0" style={{background:'var(--surface)', border:'1px solid var(--border)'}} />
              <div className="rounded-2xl px-4 py-3 text-sm animate-pulse" style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted)'}}>
                {retryMsg || "L'AI sta pensando..."}
              </div>
            </div>
          )}

          {aiSpeaking && (
            <div className="flex justify-center">
              <button onClick={() => window.speechSynthesis?.cancel()}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full animate-pulse"
                style={{color:'var(--accent2)', border:'1px solid rgba(240,148,58,0.3)', background:'rgba(240,148,58,0.1)'}}
              >
                <Volume2 size={12} /> AI sta parlando... (tap per fermare)
              </button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input fisso in basso */}
      <div className="fixed left-0 right-0 bottom-0 z-20 px-4 pb-4 pt-2" style={{background:'var(--bg)'}}>
        <div className="max-w-md mx-auto space-y-3">
          {recording && (
            <div className="flex items-center justify-center gap-2 text-sm animate-pulse" style={{color:'var(--accent1)'}}>
              <div className="w-2 h-2 rounded-full" style={{background:'var(--accent1)'}} />
              Registrazione in corso...
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text" placeholder="La tua risposta..."
              value={risposta} onChange={e => setRisposta(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && invia()}
              disabled={recording || loading}
              className="flex-1 rounded-xl px-4 py-3 outline-none text-sm transition-all disabled:opacity-40"
              style={{background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)'}}
            />
            <button onClick={recording ? stopRecording : startRecording} disabled={loading}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={recording
                ? {background:'var(--accent1)', border:'none'}
                : {background:'var(--surface)', border:'1px solid var(--border)'}
              }
            >
              {recording ? <Square size={18} color="var(--text)" /> : <Mic size={18} color="var(--muted)" />}
            </button>
            <button onClick={() => invia()} disabled={loading || !risposta.trim() || recording}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition disabled:opacity-30"
              style={{background:'linear-gradient(135deg, var(--accent1), var(--accent2))', border:'none'}}
            >
              <Send size={18} color="var(--text)" />
            </button>
          </div>

          <button onClick={salva} disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{background:'rgba(90,158,111,0.15)', border:'1px solid rgba(90,158,111,0.3)', color:'var(--success)'}}
          >
            {saving ? <><Save size={14} /> Salvataggio...</> : <><CheckCircle size={14} /> Termina e salva sessione</>}
          </button>
        </div>
      </div>
    </>
  )
}
