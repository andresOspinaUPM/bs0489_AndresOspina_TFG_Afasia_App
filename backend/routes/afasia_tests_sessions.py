import sqlite3
from fastapi import APIRouter, status, HTTPException, Depends, Body
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import JSONResponse
from database.connection import get_db_connection
from middleware.user_data import get_current_user

router = APIRouter(prefix="/afasia-tests-sessions", tags=["Afasia Tests Sessions"])

async def get_sessions_list_per_patient_from_db(dni_patient: str) -> list[dict]:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            result = cursor.execute(
                """
                SELECT * FROM sesion AS s
                JOIN configuracion_sesion AS cs ON s.id_sesion = cs.id_sesion
                WHERE cs.id_paciente = ?
                """
                ,
                (dni_patient,)
            )
            sessions = []
            rows = result.fetchall()
            for row in rows:
                session = {
                    "id_sesion": row[0],
                    "nombre_sesion": row[1],
                    "nivel": row[2],
                    "cantidad_pruebas"  : row[3],
                    "tiempo_limite_por_prueba": row[4],
                    "imagenes_aleatorias": bool(row[5]),
                }
                sessions.append(session)
            return sessions
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener la lista de sesiones del paciente desde la base de datos: {str(e)}"
        )
    
async def verify_patient_belong_to_doctor(dni_patient : str, dni_doctor: str) -> bool:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT 1 FROM paciente
                WHERE dni_paciente = ? AND dni_medico = ?
                """,
                (dni_patient, dni_doctor)
            )
            return cursor.fetchone() is not None
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"error al verificar el paciente asignado al médico: {str(e)}"
        )


async def get_session_by_id_from_db(id_sesion: int) -> dict | None:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            result = cursor.execute(
                """
                SELECT * FROM sesion 
                WHERE id_sesion = ?
                """,
                (id_sesion,)
            )
            row = result.fetchone()
            if row is None:
                return None
            session = {
                "id_sesion": row[0],
                "nombre_sesion": row[1],
                "nivel": row[2],
                "cantidad_pruebas"  : row[3],
                "tiempo_limite_por_prueba": row[4],
                "imagenes_aleatorias": bool(row[5]),
            }
            return session
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener la sesión desde la base de datos: {str(e)}"
        )
############################### ENDIPOINT ###############################

class PatientSessionsRequest(BaseModel):
    patient_dni: Optional[str] = None

@router.post('/patient-sessions-list', status_code=status.HTTP_200_OK)
async def get_patient_sessions_list(request: PatientSessionsRequest, current_user: dict = Depends(get_current_user)):
    try:
        if request.patient_dni:
            if current_user.get("user_rol") != "doctor":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Usuario no autorizado para ver la lista de sesiones de un paciente"
                )
            patient_belongs_to_doctor = await verify_patient_belong_to_doctor(request.patient_dni, current_user.get("dni"))
            if not patient_belongs_to_doctor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="paciente del médico no encontrado"
                )
            dni_patient = request.patient_dni
        else:
            dni_patient = current_user.get("dni")

        sessions_list = await get_sessions_list_per_patient_from_db(dni_patient)
        response_data = {
        "success": True,
        "message": "Lista de sesiones obtenida con éxito",
        "payload": sessions_list
        }
        return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response_data
        )
    except HTTPException:
        raise

@router.get('/session/{id_sesion}', status_code=status.HTTP_200_OK)
async def get_session_by_id(id_sesion: int, current_user: dict = Depends(get_current_user)):
    try:
        session = await get_session_by_id_from_db(id_sesion)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sesión no encontrada"
            )
        response_data = {
        "success": True,
        "message": "Sesión obtenida con éxito",
        "payload": session
        }
        return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response_data
        )
    except HTTPException:
        raise