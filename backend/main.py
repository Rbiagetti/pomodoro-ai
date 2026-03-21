from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, audio, sessions

app = FastAPI(
    title="Pomodoro AI API",
    description="Backend per l'app di studio con AI socratica",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# In produzione sostituisci "*" con il dominio del tuo frontend su Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(audio.router)
app.include_router(sessions.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Pomodoro AI API is running 🍅"}


@app.head("/health")
def health_head():
    return {}
