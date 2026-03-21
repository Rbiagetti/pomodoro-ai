from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str

# ── Audio / AI ────────────────────────────────────────────────────────────────
class TranscribeResponse(BaseModel):
    trascrizione: str

class AnalyzeRequest(BaseModel):
    argomento: str
    trascrizione: str

class AnalyzeResponse(BaseModel):
    analisi: str

class QuestionRequest(BaseModel):
    argomento: str
    trascrizione: str
    analisi: str
    chat_history: list[dict]

class QuestionResponse(BaseModel):
    domanda: str

# ── Sessions ──────────────────────────────────────────────────────────────────
class SessionCreate(BaseModel):
    argomento: str
    trascrizione: str
    analisi: str
    n_domande: int
    durata_minuti: int
    chat_history: Optional[List[dict]] = []
    tags: Optional[List[str]] = []

class SessionResponse(BaseModel):
    id: str
    argomento: str
    analisi: str
    trascrizione: Optional[str] = ""
    n_domande: int
    durata_minuti: int
    chat_history: Optional[List[dict]] = []
    tags: Optional[List[str]] = []
    created_at: datetime
