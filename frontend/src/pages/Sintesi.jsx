import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import API from '../services/api'

export default function Sintesi() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const argomento = state?.argomento || localStorage.getItem('argomento')
  const durata = state?.durata || localStorage.getItem('durata')

  const [tab, setTab] = useState('registra')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const mediaRef = useRef(null)
  const fileRef = useRef(null)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    const chunks = []
    recorder.ondataavailable = e => chunks.push(e.data)
    recorder.onstop = () => setAudioBlob(new Blob(chunks, { type: 'audio/wav' }))
    recorder.start()
    mediaRef.current = recorder
    setRecording(true)
    setAudioBlob(null)
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const analizza = async () => {
    const file = tab === 'registra' ? audioBlob : uploadedFile
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      const filename = tab === 'registra' ? 'sintesi.wav' : uploadedFile.name
      formData.append('file', file, filename)
      const { data: trascrData } = await API.post('/audio/transcribe', formData)
      const { data: analisiData } = await API.post('/audio/analyze', {
        argomento,
        trascrizione: trascrData.trascrizione,
      })
      navigate('/interrogazione', {
        state: { argomento, durata, trascrizione: trascrData.trascrizione, analisi: analisiData.analisi }
      })
    } catch (e) {
      alert('Errore: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  const hasAudio = tab === 'registra' ? audioBlob : uploadedFile

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white" style={{fontFamily:'Georgia, serif'}}>🎙️ Sintesi vocale</h2>
          <p className="text-gray-500 text-sm mt-2">
            Spiega tutto quello che ricordi su <span className="text-red-400">{argomento}</span>
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-5 bg-white/5 border border-white/10 rounded-2xl p-1">
          {['registra', 'carica'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setAudioBlob(null); setUploadedFile(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-white/10 text-white shadow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'registra' ? '🔴 Registra' : '📁 Carica file'}
            </button>
          ))}
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-6 space-y-4">

          {tab === 'registra' && (
            <>
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full py-5 rounded-2xl font-bold text-sm transition-all relative overflow-hidden ${
                  recording
                    ? 'bg-gray-800 border border-white/10 text-gray-300'
                    : 'text-white'
                }`}
                style={!recording ? {background:'linear-gradient(135deg,#ef4444,#f97316)'} : {}}
              >
                {recording && (
                  <span className="absolute inset-0 bg-red-500/10 animate-pulse rounded-2xl" />
                )}
                <span className="relative z-10">
                  {recording ? '⏹ Stop registrazione' : '🔴 Inizia a registrare'}
                </span>
              </button>

              {recording && (
                <div className="flex items-center justify-center gap-2 text-red-400 text-sm animate-pulse">
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  Sto registrando...
                </div>
              )}

              {audioBlob && (
                <audio controls src={URL.createObjectURL(audioBlob)} className="w-full rounded-xl" />
              )}
            </>
          )}

          {tab === 'carica' && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-2xl border-2 border-dashed border-white/15 text-gray-500 hover:border-red-500/40 hover:text-gray-300 transition-all text-sm flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📁</span>
                <span>{uploadedFile ? uploadedFile.name : 'Clicca per caricare un file MP3'}</span>
                <span className="text-xs text-gray-600">MP3</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".mp3,audio/mpeg"
                className="hidden"
                onChange={e => setUploadedFile(e.target.files[0] || null)}
              />
              {uploadedFile && (
                <audio controls src={URL.createObjectURL(uploadedFile)} className="w-full rounded-xl" />
              )}
            </>
          )}

          <button
            onClick={analizza}
            disabled={!hasAudio || loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{background: hasAudio && !loading ? 'linear-gradient(135deg,#10b981,#059669)' : '#1f1f2e'}}
          >
            {loading ? '⏳ Analisi in corso...' : '📝 Trascrivi e analizza'}
          </button>
        </div>
      </div>
    </div>
  )
}
