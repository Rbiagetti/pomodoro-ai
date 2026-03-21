from fastapi import APIRouter, HTTPException
from models import RegisterRequest, LoginRequest, AuthResponse
from services.supabase_service import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    try:
        res = supabase.auth.sign_up({"email": body.email, "password": body.password})
        if not res.user:
            raise HTTPException(status_code=400, detail="Registrazione fallita")
        return AuthResponse(
            access_token=res.session.access_token,
            user_id=res.user.id,
            email=res.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        if not res.user:
            raise HTTPException(status_code=401, detail="Credenziali errate")
        return AuthResponse(
            access_token=res.session.access_token,
            user_id=res.user.id,
            email=res.user.email,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
