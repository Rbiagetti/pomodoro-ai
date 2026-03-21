import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import API from '../services/api'

function getSupportedMimeType() {
  const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg']
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return 'audio/mp4'
}

function mimeToExt(mimeType) {
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
}

export default function Sintesi() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const argomento = state?.argomento || localStorage.getItem('argomento')
  const durata = state?.durata || localStorage.getItem('durata')

  const [tab, setTab] = useState('registra')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [mimeType, setMimeType] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const mediaRef = useRef(null)
  const fileRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      setError(null); setAudioBlob(null); setAudioUrl(null)
      chunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {})
      const actualMime = recorder.mimeType || mime || 'audio/mp4'
      setMimeType(actualMime)
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: actualMime })
        setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start(250); mediaRef.current = recorder; setRecording(true)
    } catch(e) { setError('Microfono non disponibile: ' + e.message) }
  }

  const stopRecording = () => {
    if (mediaRef.current?.state !== 'inactive') mediaRef.current?.stop()
    setRecording(false)
  }

  const analizza = async () => {
    const file = tab === 'registra' ? audioBlob : uploadedFile
    if (!file) return
    setLoading(true); setError(null)
    try {
      const formData = new FormData()
      const ext = tab === 'registra' ? mimeToExt(mimeType) : uploadedFile.name.split('.').pop()
      formData.append('file', file, `sintesi.${ext}`)
      const { data: trascrData } = await API.post('/audio/transcribe', formData)
      const { data: analisiData } = await API.post('/audio/analyze', { argomento, trascrizione: trascrData.trascrizione })
      navigate('/interrogazione', { state: { argomento, durata, trascrizione: trascrData.trascrizione, analisi: analisiData.analisi } })
    } catch (e) {
      setError('Errore: ' + (e.response?.data?.detail || e.message))
    } finally { setLoading(false) }
  }

  const hasAudio = tab === 'registra' ? audioBlob : uploadedFile

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{color:'var(--text)', fontFamily:"'Oswald', sans-serif", letterSpacing:'0.5px'}}>
            🎙️ Sintesi vocale
          </h2>
          <p style={{color:'var(--muted)', fontSize:'14px'}}>
            Spiega tutto quello che ricordi su <span style={{color:'var(--accent1)'}}>{argomento}</span>
          </p>
        </div>

        {/* Tab */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
          {['registra', 'carica'].map(t => (
            <button key={t}
              onClick={() => { setTab(t); setAudioBlob(null); setAudioUrl(null); setUploadedFile(null) }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={tab === t
                ? {background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border2)'}
                : {color:'var(--muted)', border:'1px solid transparent'}
              }
            >
              {t === 'registra' ? '🔴 Registra' : '📁 Carica file'}
            </button>
          ))}
        </div>

        <div className="rounded-3xl p-6 space-y-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>

          {tab === 'registra' && (
            <>
              <button
                onClick={recording ? stopRecording : startRecording}
                className="w-full py-5 rounded-2xl font-bold text-sm transition-all relative overflow-hidden"
                style={recording
                  ? {background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text2)'}
                  : {background:'linear-gradient(135deg, var(--accent1), var(--accent2))', color:'var(--text)', border:'none'}
                }
              >
                {recording && <span className="absolute inset-0 animate-pulse" style={{background:'rgba(255,107,61,0.08)'}} />}
                <span className="relative z-10">{recording ? '⏹ Stop registrazione' : '🔴 Inizia a registrare'}</span>
              </button>
              {recording && (
                <div className="flex items-center justify-center gap-2 text-sm animate-pulse" style={{color:'var(--accent1)'}}>
                  <span className="w-2 h-2 rounded-full" style={{background:'var(--accent1)'}} />
                  Sto registrando...
                </div>
              )}
              {audioUrl && <audio controls src={audioUrl} className="w-full rounded-xl" />}
            </>
          )}

          {tab === 'carica' && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-2xl text-sm flex flex-col items-center gap-2 transition-all"
                style={{border:'2px dashed var(--border2)', color:'var(--muted)'}}
              >
                <span className="text-3xl">📁</span>
                <span>{uploadedFile ? uploadedFile.name : 'Clicca per caricare un file MP3'}</span>
              </button>
              <input ref={fileRef} type="file" accept=".mp3,audio/mpeg" className="hidden" onChange={e => setUploadedFile(e.target.files[0] || null)} />
              {uploadedFile && <audio controls src={URL.createObjectURL(uploadedFile)} className="w-full rounded-xl" />}
            </>
          )}

          {error && (
            <div className="rounded-2xl px-4 py-3 text-xs" style={{background:'rgba(255,107,61,0.1)', border:'1px solid rgba(255,107,61,0.2)', color:'var(--accent1)'}}>
              {error}
            </div>
          )}

          <button
            onClick={analizza}
            disabled={!hasAudio || loading}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-30"
            style={{background: hasAudio && !loading ? 'linear-gradient(135deg, var(--success), #4a8a5f)' : 'var(--surface2)', color:'var(--text)', border:'none'}}
          >
            {loading ? '⏳ Analisi in corso...' : '📝 Trascrivi e analizza'}
          </button>
        </div>
      </div>
    </div>
  )
}
