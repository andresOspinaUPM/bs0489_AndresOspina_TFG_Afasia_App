from utils.jwt_utils import decode_access_token
from fastapi import Depends, HTTPException, status, Header

def get_current_user(authorization: str = Header(None)) -> dict:
    try:
        if not authorization:
            print("Falta el encabezado de autorización")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Falta el encabezado de autorización"
            )
        if not authorization.startswith("Bearer "):
            print("Encabezado de autorización inválido")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Encabezado de autorización inválido"
            )
        token = authorization.split(" ")[1]
        print("Decodificando token para obtener doctor actual: " + str(token))
        user_data = decode_access_token(token)

        return user_data
    except Exception as e:
        print("Error al obtener el doctor actual: " + str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}"
        )