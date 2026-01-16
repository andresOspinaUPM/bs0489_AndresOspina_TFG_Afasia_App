from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import JSONResponse
from database.connection import get_db_connection
from middleware.user_data import get_current_user
import sqlite3

router = APIRouter(prefix='/afasia-test-records', tags=['Afasia Tests Records'])
database = "afasia_database.db"

async def is_session_instance_completed(id_session: int) -> bool:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT EXISTS(
                SELECT 1
                FROM instancia_sesion
                WHERE id_sesion = ?
                AND completada = 1
                )
                """,
                (id_session,)
            )
            row = cursor.fetchone()
            return bool(row[0]) if row else False
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener si se ha completado la instancia de la sesion: {str(e)}"
        )

async def get_session_instances_records(id_session: int) -> list[dict]:
    try:
        with get_db_connection(database) as conn:
            cursor=conn.cursor()
            cursor.execute(
                """
                 SELECT reg.id_instancia, p.nombre_palabra, res.fecha_respuesta, res.tiempo_respuesta, res.respuesta_correcta
                 FROM respuesta_prueba AS res
                 INNER JOIN registro_ejecucion_prueba AS reg ON res.id_prueba = reg.id_ejecucion_prueba
                 INNER JOIN instancia_sesion AS inst_s ON inst_s.id_instancia = reg.id_instancia
                 LEFT JOIN palabra AS p ON p.id_palabra = reg.id_palabra
                 WHERE inst_s.id_sesion = ?
                 ORDER BY reg.id_instancia
                 """,
                 (id_session,)
            )
            rows = cursor.fetchall()
            instances_list = []
            current_instance = None
            for row in rows:
                id_instancia = row[0]
                if current_instance is None or current_instance['id_instancia'] != id_instancia:
                    if current_instance is not None:
                        instances_list.append(current_instance)
                    current_instance={
                        'id_instancia': id_instancia,
                        'respuestas':[]
                    }
                respuesta = {
                    "nombre_palabra":row[1],
                    "fecha_respuesta":row[2],
                    "tiempo_respuesta":row[3],
                    "respuesta_correcta":bool(row[4])
                }
                current_instance['respuestas'].append(respuesta)
            if current_instance is not None:
                instances_list.append(current_instance)
            return instances_list
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener los registros de las sesiones realizadas: {str(e)}"
        )


# # --------------- ENDPOINTS --------------- #
@router.get('/session-instance-completed/{id_session}', status_code=status.HTTP_200_OK)
async def is_session_completed(id_session: int, current_patient: dict = Depends(get_current_user)):
    try:
        instance_completed = await is_session_instance_completed(id_session)
        if not instance_completed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"BE - Error al obtener si una instancia de la sesion se ha completado"

            )
        response_data = {
            "success":True,
            "message":"La instancia de sesion se ha completado al menos una vez"
        }
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener si una instancia de la sesion se ha completado"
        )

@router.get('/get-instances-records/{id_session}', status_code=status.HTTP_200_OK)
async def get_intances_records(id_session: int, current_patient: dict = Depends(get_current_user)):
    try:
        instances_records = await get_session_instances_records(id_session)
        response_data = {
            "success":True,
            "message":"Se han obtenido los registrod de las instancias para la sesion",
            "payload": instances_records
        }
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener si una instancia de la sesion se ha completado"
        )