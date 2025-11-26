from utils.jwt_utils import decode_access_token
from fastapi import Depends, HTTPException, status

def get_current_doctor(token: str = Depends(decode_access_token)) -> dict:
    try:
        user_data = decode_access_token(token)
        if user_data.get("user_rol") != "doctor":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: No es un doctor"
            )
        return user_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}"
        )