import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, Query
from models import SessionCreate, SessionResponse
from services.supabase_service import supabase
from auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("", status_code=201)
def create_session(body: SessionCreate, current_user: dict = Depends(get_current_user)):
    try:
        supabase.table("sessions").insert({
            "user_id": current_user["user_id"],
            "argomento": body.argomento,
            "trascrizione": body.trascrizione,
            "analisi": body.analisi,
            "n_domande": body.n_domande,
            "durata_minuti": body.durata_minuti,
            "chat_history": body.chat_history,
            "tags": body.tags,
        }).execute()
        return {"message": "Sessione salvata"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=list[SessionResponse])
def get_sessions(
    current_user: dict = Depends(get_current_user),
    search: Optional[str] = Query(None),
):
    try:
        query = supabase.table("sessions") \
            .select("*") \
            .eq("user_id", current_user["user_id"]) \
            .order("created_at", desc=True)
        if search:
            query = query.ilike("argomento", f"%{search}%")
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("sessions") \
            .select("*") \
            .eq("id", session_id) \
            .eq("user_id", current_user["user_id"]) \
            .single() \
            .execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Sessione non trovata")

@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        supabase.table("sessions") \
            .delete() \
            .eq("id", session_id) \
            .eq("user_id", current_user["user_id"]) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
