# 🍅 Pomodoro AI

> *"Se non riesci a spiegarlo, non lo hai capito"* — Feynman

Un'app di studio che combina la tecnica Pomodoro con l'interrogazione socratica dell'AI. Studia, spiega a voce, fatti interrogare dall'AI, riposa.

---

## 🌐 Live

| | URL |
|---|---|
| **App** | https://pomodoroai-bice.vercel.app |
| **Backend API** | https://pomodoro-ai-u1cn.onrender.com |
| **API Docs** | https://pomodoro-ai-u1cn.onrender.com/docs |

---

## 🔁 Flusso funzionale
```
1. LOGIN
   └── Supabase Auth (email + password)

2. SETUP
   └── Inserisci argomento + durata pomodoro + durata pausa

3. POMODORO 🍅
   └── Timer circolare countdown
   └── Al termine → fase CHAT (timer si ferma)

4. SINTESI 🎙️
   └── Registra spiegazione vocale (o carica MP3)
   └── Whisper trascrive
   └── LLaMA 70B analizza lacune e punti di forza

5. INTERROGAZIONE 🤖
   └── AI fa domande socratiche sulle lacune
   └── Rispondi a testo o voce
   └── AI non spiega mai — solo domande
   └── Al termine → sessione salvata su Supabase

6. PAUSA ☕
   └── Timer pausa parte automaticamente
   └── Al termine → IDLE, pronto per nuovo pomodoro
```

---

## 🏗️ Architettura
```
Frontend (React + Vite)          Backend (FastAPI)
  Vercel                    →      Render
     │                                │
     │   REST API + JWT               │
     └────────────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          │                       │
                       Supabase                 Groq
                    (DB + Auth)          (Whisper + LLaMA)
```

---

## 📁 Struttura progetto
```
pomodoro-ai/
│
├── backend/                        # FastAPI
│   ├── main.py                     # Entry point, CORS, router mount
│   ├── auth.py                     # JWT verification (Supabase)
│   ├── config.py                   # Settings da .env
│   ├── models.py                   # Pydantic schemas
│   ├── build.sh                    # Script build per Render
│   ├── Procfile                    # Start command per Render
│   ├── requirements.txt
│   ├── routers/
│   │   ├── auth.py                 # POST /auth/login, /auth/register
│   │   ├── audio.py                # POST /audio/transcribe, /analyze, /question
│   │   └── sessions.py             # POST/GET/DELETE /sessions
│   └── services/
│       ├── groq_service.py         # Whisper + LLaMA logic
│       └── supabase_service.py     # Supabase client
│
└── frontend/                       # React + Vite + Tailwind
    ├── index.html
    ├── vite.config.js
    ├── vercel.json                  # SPA routing fix
    └── src/
        ├── App.jsx                  # Router + auth state
        ├── main.jsx
        ├── index.css                # Design system (CSS variables)
        ├── components/
        │   ├── Layout.jsx           # Shell: sidebar + topbar + blobs
        │   ├── PomodoroTimer.jsx    # Timer globale (stato condiviso)
        │   └── HowItWorks.jsx      # Pannello info laterale
        ├── pages/
        │   ├── Login.jsx            # Auth page
        │   ├── Timer.jsx            # Setup sessione
        │   ├── Pomodoro.jsx         # Timer circolare attivo
        │   ├── Sintesi.jsx          # Registrazione + upload
        │   ├── Interrogazione.jsx   # Chat AI socratica
        │   └── Sessioni.jsx         # Storico sessioni
        └── services/
            ├── api.js               # Axios client + JWT interceptor
            └── supabase.js          # Supabase JS client
```

---

## 🗄️ Database (Supabase)

### Tabella `sessions`
| Campo | Tipo | Note |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Supabase Auth user |
| argomento | TEXT | Argomento studiato |
| trascrizione | TEXT | Output Whisper |
| analisi | TEXT | Output LLaMA |
| chat_history | JSONB | Array messaggi AI |
| n_domande | INT | Numero domande AI |
| durata_minuti | INT | Durata pomodoro |
| tags | TEXT[] | Tag opzionali |
| created_at | TIMESTAMP | Auto |

---

## 🔌 API Endpoints

### Auth
```
POST /auth/register    { email, password } → { access_token, user_id, email }
POST /auth/login       { email, password } → { access_token, user_id, email }
```

### Audio (🔒 JWT required)
```
POST /audio/transcribe    multipart/form-data (file) → { trascrizione }
POST /audio/analyze       { argomento, trascrizione } → { analisi }
POST /audio/question      { argomento, trascrizione, analisi, chat_history } → { domanda }
```

### Sessions (🔒 JWT required)
```
GET    /sessions           → [ session ]
POST   /sessions           { argomento, trascrizione, analisi, ... } → 201
GET    /sessions/{id}      → session
DELETE /sessions/{id}      → 204
```

---

## 🎨 Design System

Font: **Oswald** (titoli) + **Space Mono** (numeri/timer) + **DM Sans** (body)
```css
--bg:        #0c0a08   /* nero caldo */
--surface:   #181512   /* card base */
--surface2:  #221e1a   /* card elevata */
--accent1:   #ff6b3d   /* rosso pomodoro */
--accent2:   #f0943a   /* arancio ambrato */
--accent3:   #e8b84a   /* giallo caldo */
--success:   #5a9e6f   /* verde oliva */
--muted:     #9a8878   /* testo secondario */
--text:      #f8f0e8   /* bianco caldo */
```

---

## 🚀 Setup locale

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # riempi con i tuoi secrets
PYTHONPATH=/path/to/pomodoro-ai/backend uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # riempi con i tuoi secrets
npm run dev
```

### Variabili d'ambiente

**backend/.env**
```
GROQ_API_KEY=...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_JWT_SECRET=...
```

**frontend/.env**
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=eyJ...
VITE_API_URL=https://pomodoro-ai-u1cn.onrender.com
```

---

## 🔧 Deploy

### Backend → Render
1. Nuovo Web Service da GitHub
2. Root directory: `backend`
3. Build command: `bash build.sh`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Aggiungi le 4 env variables

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```
Aggiungi le 3 env variables su Vercel dashboard.

> ✅ Il backend è sempre sveglio grazie a **UptimeRobot** che fa ping ogni 5 minuti su .
> Configurazione: uptimerobot.com → HTTP monitor → https://pomodoro-ai-u1cn.onrender.com/health → ogni 5 min.

---

## 🔄 Come fare modifiche

### Modifica backend
```bash
# 1. Modifica i file in backend/
# 2. Testa in locale
cd backend && PYTHONPATH=. uvicorn main:app --reload
# 3. Push → Render rideploya automaticamente
git add . && git commit -m "fix: descrizione" && git push
```

### Modifica frontend
```bash
# 1. Modifica i file in frontend/src/
# 2. Testa in locale
cd frontend && npm run dev
# 3. Deploy
git add . && git commit -m "fix: descrizione" && git push
cd frontend && vercel --prod
```

### Aggiungere una pagina
1. Crea `frontend/src/pages/NuovaPagina.jsx`
2. Importa in `App.jsx`
3. Aggiungi `<Route path="/nuova" element={<NuovaPagina />} />`
4. Opzionale: aggiungi link in `Layout.jsx` → `navItems`

### Aggiungere un endpoint API
1. Aggiungi la funzione in `backend/services/groq_service.py` o `supabase_service.py`
2. Aggiungi il router in `backend/routers/`
3. Monta in `backend/main.py` se è un nuovo router
4. Aggiungi lo schema in `backend/models.py`

---

## 📦 Stack completo

| Layer | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI + Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Trascrizione | Groq Whisper Large v3 |
| AI | Groq LLaMA 3.3 70B |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| Font | Oswald + Space Mono + DM Sans |
