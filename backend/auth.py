from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            key="secret",
            options={"verify_signature": False, "verify_aud": False, "verify_exp": False},
            algorithms=["HS256", "ES256", "RS256"],
        )
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token non valido")
        return {"user_id": user_id, "email": email}
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token non valido: {e}")
