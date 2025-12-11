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
                    "imagenes_aleatorias": bool(row[6]),
                }
                sessions.append(session)
            return sessions
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener la lista de sesiones del paciente desde la base de datos: {str(e)}"
        )

async def get_session_by_id_from_db(id_session: int) -> dict | None:
    try:
        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()
            result = cursor.execute(
                """
                SELECT * FROM sesion 
                WHERE id_sesion = ?
                """,
                (id_session,)
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
                "imagenes_aleatorias": bool(row[6]),
            }
            return session
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener la sesión desde la base de datos: {str(e)}"
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

@router.get('/session/{id_sesion}', status_code:status.HTTP_200_OK)
async def get_session_by_id(id_session: int):
    session = await get_session_by_id_from_db(id_session)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada"
        )
        response_data = {
        "success": True,
        "message": "Sesión obtenida con éxito",
        "data": session
        }
        return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=response_data
        )
    except Exception as e:
        raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Error al obtener la sesión: {str(e)}"
        )