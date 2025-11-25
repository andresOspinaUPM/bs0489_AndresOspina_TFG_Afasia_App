from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database.connection import get_db_connection
from utils.jwt_utils import create_access_token
import sqlite3

router = APIRouter(prefix='/auth')

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post('/login')
async def login(credentials: LoginRequest):
    try:
        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()
            user = cursor.execute("SELECT dni, nombre, email, contrasena FROM usuario WHERE email = ? AND contrasena = ?", (credentials.email, credentials.password)).fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, 
                    detail="Email o contraseña incorrectos"
                )

            user_dni = user[0]
            user_name = user[1]

            doctor = cursor.execute("SELECT dni_medico FROM medico WHERE dni_medico = ?", (user_dni,)).fetchone()
            if doctor:
                user_rol = "doctor"
            else:
                user_rol = "paciente"

            token_data={
                "dni": user_dni,
                "email": credentials.email,
                "user_rol": user_rol,
                "name": user_name
            }

            access_token = create_access_token(token_data)

            response_data = {
                "success": True,
                "message": "Inicio de sesión exitoso",
                "access_token": access_token,
                "token_type": "bearer",
                "user_rol": user_rol,
                "name": user_name
            }

            return JSONResponse(
                status_code = status.HTTP_200_OK,
                content = response_data
            )

    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error de base de datos: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado: {e}"
        )