from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import JSONResponse
from database.connection import get_db_connection
from middleware.user_data import get_current_user
import sqlite3

router = APIRouter(prefix="/afasia-tests-sessions", tags=["Afasia Tests Sessions"])

async def get_sessions_list_per_patient_from_db(dni_patient: str) -> list[dict]:
    try:
        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()
            result = cursor.execute(
                """
                SELECT s.id_sesion, s.nombre_sesion FROM sesion AS s
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
                    "nombre_sesion": row[1]
                }
                sessions.append(session)
            return sessions
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener la lista de sesiones del paciente desde la base de datos: {str(e)}"
        )
############################### ENDIPOINT ###############################

@router.get('/patient-sessions-list', status_code=status.HTTP_200_OK)
async def get_patient_sessions_list(current_patient: dict = Depends(get_current_user)):
    try:
        print(f'Current patient data: {current_patient}')
        dni_patient = current_patient.get('dni')
        print(f'DNI Paciente: {dni_patient}')
        sessions_list = await get_sessions_list_per_patient_from_db(dni_patient)
        response_data = {
        "success": True,
        "message": "Lista de sesiones obtenida con éxito",
        "data": sessions_list
        }
        return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response_data
        )
    except Exception as e:
        raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Error al obtener la lista de sesiones del paciente: {str(e)}"
        )
