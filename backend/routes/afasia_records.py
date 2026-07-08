import sqlite3
from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import JSONResponse
from database.connection import get_db_connection
from middleware.user_data import get_current_user

router = APIRouter(prefix='/afasia-test-records', tags=['Afasia Tests Records'])

async def is_session_instance_completed(id_session: int, dni_usuario: str, user_rol:str) -> bool:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            column_of_requester = "id_medico" if user_rol == "doctor" else "id_paciente"
            cursor.execute(
                f"""
                SELECT EXISTS(
                SELECT 1
                FROM instancia_sesion AS inst_s
                INNER JOIN configuracion_sesion AS cs ON cs.id_sesion = inst_s.id_sesion
                WHERE inst_s.id_sesion = ?
                AND cs.{column_of_requester} = ?
                AND inst_s.completada = 1
                )
                """,
                (id_session, dni_usuario)
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

async def get_session_instances_records(id_session: int, dni_usuario: str, user_rol: str, word: str = None) -> list[dict]:
    try:
        with get_db_connection() as conn:
            cursor=conn.cursor()
            column_of_requester = "id_medico" if user_rol == "doctor" else "id_paciente"
            base_query = f"""
                SELECT reg.id_instancia, p.nombre_palabra, res.fecha_respuesta, res.tiempo_respuesta, res.respuesta_correcta
                FROM respuesta_prueba AS res
                INNER JOIN registro_ejecucion_prueba AS reg ON res.id_prueba = reg.id_ejecucion_prueba
                INNER JOIN instancia_sesion AS inst_s ON inst_s.id_instancia = reg.id_instancia
                INNER JOIN configuracion_sesion AS cs ON cs.id_sesion = inst_s.id_sesion
                LEFT JOIN palabra AS p ON p.id_palabra = reg.id_palabra
                WHERE inst_s.id_sesion = ?
                AND cs.{column_of_requester} = ?
            """

            if word is None:
                cursor.execute(base_query + " ORDER BY reg.id_instancia", (id_session, dni_usuario))
            else:
                cursor.execute(base_query + " AND p.nombre_palabra = ? ORDER BY reg.id_instancia", (id_session, dni_usuario, word))
            # if word is None :
            #     cursor.execute(
            #         """
            #         SELECT reg.id_instancia, p.nombre_palabra, res.fecha_respuesta, res.tiempo_respuesta, res.respuesta_correcta
            #         FROM respuesta_prueba AS res
            #         INNER JOIN registro_ejecucion_prueba AS reg ON res.id_prueba = reg.id_ejecucion_prueba
            #         INNER JOIN instancia_sesion AS inst_s ON inst_s.id_instancia = reg.id_instancia
            #         INNER JOIN configuracion_sesion AS cs ON cs.id_sesion = inst_s.id_sesion
            #         LEFT JOIN palabra AS p ON p.id_palabra = reg.id_palabra
            #         WHERE inst_s.id_sesion = ?
            #         AND cs.{column_of_requester}
            #         ORDER BY reg.id_instancia
            #         """,
            #         (id_session,)
            #     )
            # else:
            #     cursor.execute(
            #         """
            #         SELECT reg.id_instancia, p.nombre_palabra, res.fecha_respuesta, res.tiempo_respuesta, res.respuesta_correcta
            #         FROM respuesta_prueba AS res
            #         INNER JOIN registro_ejecucion_prueba AS reg ON res.id_prueba = reg.id_ejecucion_prueba
            #         INNER JOIN instancia_sesion AS inst_s ON inst_s.id_instancia = reg.id_instancia
            #         LEFT JOIN palabra AS p ON p.id_palabra = reg.id_palabra
            #         WHERE inst_s.id_sesion = ?
            #         AND p.nombre_palabra = ?
            #         ORDER BY reg.id_instancia
            #         """,
            #         (id_session, word)
            #     )

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

async def get_words_answered(id_session: int, dni_usuario: str, user_rol: str) -> list[dict]:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            column_of_requester = "id_medico" if user_rol == "doctor" else "id_paciente"
            cursor.execute(
                f"""
                SELECT DISTINCT p.nombre_palabra FROM palabra AS p
                INNER JOIN registro_ejecucion_prueba AS reg_p ON p.id_palabra = reg_p.id_palabra
                INNER JOIN respuesta_prueba AS res_p ON reg_p.id_ejecucion_prueba = res_p.id_prueba
                INNER JOIN instancia_sesion AS ins_s ON reg_p.id_instancia = ins_s.id_instancia
                INNER JOIN configuracion_sesion AS cs ON cs.id_sesion = ins_s.id_sesion
                WHERE ins_s.id_sesion = ?
                AND cs.{column_of_requester} = ?
                """
                ,(id_session, dni_usuario)
            )
            rows = cursor.fetchall()
            response_data = []
            for row in rows:
                response_data.append(row[0])
            return response_data
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener las palabras respondidas: {str(e)}"
        )


# # --------------- ENDPOINTS --------------- #
@router.get('/session-instance-completed/{id_session}', status_code=status.HTTP_200_OK)
async def is_session_completed(id_session: int, current_user: dict = Depends(get_current_user)):
    try:
        instance_completed = await is_session_instance_completed(id_session, current_user.get("dni"), current_user.get("user_rol"))
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

@router.get('/get-instances-records/{id_session}', status_code=status.HTTP_200_OK)
async def get_intances_records(id_session: int, current_user: dict = Depends(get_current_user)):
    try:
        instances_records = await get_session_instances_records(id_session, current_user.get("dni"), current_user.get("user_rol"))
        response_data = {
            "success":True,
            "message":"Se han obtenido los registros de las instancias para la sesion",
            "payload": instances_records
        }
        return response_data
    except HTTPException:
        raise

@router.get('/get-answered-words/{id_session}', status_code=status.HTTP_200_OK)
async def get_answered_words(id_session: int, current_user: dict = Depends(get_current_user)):
    try:
        words_responses = await get_words_answered(id_session, current_user.get("dni"), current_user.get("user_rol"))
        response_data = {
            "success":True,
            "message":"Se han obtenido las palabras respondidas exitosamente",
            "payload":words_responses
        }
        return response_data
    except HTTPException:
        raise

@router.get('/get-records-by-word/{id_session}/{word}', status_code=status.HTTP_200_OK)
async def get_records_by_word(id_session: int, word: str, current_user: dict = Depends(get_current_user)):
    try:
        instances_records = await get_session_instances_records(id_session, current_user.get("dni"), current_user.get("user_rol"), word)
        response_data = {
            "success":True,
            "message":"Se han obtenido los registros por palabra",
            "payload": instances_records
        }
        return response_data
    except HTTPException:
        raise