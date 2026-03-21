import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from models import AnalyzeRequest, AnalyzeResponse, QuestionRequest, QuestionResponse, TranscribeResponse
from services import groq_service
from auth import get_current_user

router = APIRouter(prefix="/audio", tags=["audio"])

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    allowed = {"audio/wav", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/webm", "audio/x-m4a", "video/mp4", "application/octet-stream"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Formato non supportato: {file.content_type}")
    audio_bytes = await file.read()
    testo = groq_service.trascrivi(audio_bytes, file.filename or "audio.wav")
    return TranscribeResponse(trascrizione=testo)

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest, current_user: dict = Depends(get_current_user)):
    analisi = groq_service.analizza(body.argomento, body.trascrizione)
    return AnalyzeResponse(analisi=analisi)

@router.post("/question", response_model=QuestionResponse)
def question(body: QuestionRequest, current_user: dict = Depends(get_current_user)):
    domanda = groq_service.genera_domanda(body.argomento, body.trascrizione, body.analisi, body.chat_history)
    return QuestionResponse(domanda=domanda)
