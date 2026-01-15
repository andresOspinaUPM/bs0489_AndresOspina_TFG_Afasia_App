from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from database.connection import get_db_connection
from middleware.user_data import get_current_user
import sqlite3

router = APIRouter(prefix='/configuration-sessions', tags=['configuration-sessions'])

async def get_total_words_from_db() -> int:
    try:
        with get_db_connection('afasia_database.db') as conn:
            cursor = conn.cursor()
            result = cursor.execute(
                """
                SELECT COUNT(*) FROM palabra
                """
            )
            total_words = result.fetchone()[0]
            return total_words
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener el total de palabras de la base de datos: {str(e)}"
        )
            

async def insert_sesion_in_db (dni_doctor: str, config_data: dict):
    try:
        dni_paciente = config_data.get("dni_paciente")
        nivel = config_data.get("nivel")
        nivel = nivel.capitalize()
        cantidad_pruebas = config_data.get("cantidad_pruebas")
        tiempo_limite_por_prueba = config_data.get("tiempo_limite_por_prueba")
        imagenes_aleatorias = config_data.get("imagenes_aleatorias", False)

        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO sesion (nombre_sesion, nivel, cantidad_pruebas, tiempo_limite_por_prueba, imagenes_aleatorias)
                VALUES(?,?,?,?,?)
                """
                ,
                (
                    f"Sesion {nivel} - {cantidad_pruebas} pruebas",
                    nivel,
                    cantidad_pruebas,
                    tiempo_limite_por_prueba,
                    imagenes_aleatorias
                )
            )
            id_sesion = cursor.lastrowid
            print(f"ID Sesion creada: {id_sesion}")
            await insert_configuracion_sesion_in_db(cursor,dni_doctor, dni_paciente, id_sesion)

            if(not imagenes_aleatorias):
                words = await configure_random_words_for_session(cursor, id_sesion, cantidad_pruebas, nivel)
                print(f"Palabras aleatorias: {words}")
                orden_prueba = 1
                for word in words:
                    await insert_sesion_prueba_predefinida(cursor, id_sesion, word[0], orden_prueba)
                    orden_prueba += 1

            conn.commit()
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al configurar las sesiones en la base de datos: {str(e)}"
        )

async def insert_configuracion_sesion_in_db(cursor, dni_doctor: str, dni_paciente: str, id_sesion: int):
    try:
        cursor.execute(
            """
            INSERT INTO configuracion_sesion (id_medico, id_paciente, id_sesion)
            VALUES(?,?,?)
            """
            ,
            (
                dni_doctor,
                dni_paciente,
                id_sesion
            )
        )

    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al asignar la configuración de sesión al paciente: {str(e)}"
        )


async def insert_sesion_prueba_predefinida(cursor, id_sesion: int, word_id: int, orden_prueba: int):
    try:
        cursor.execute(
            """
            INSERT INTO sesion_prueba_predefinida (id_sesion, id_palabra, orden_prueba)
            VALUES(?,?,?)
            """
            ,
            (id_sesion, word_id, orden_prueba)
        )

    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al asignar palabra a la sesión: {str(e)}"
        )


async def configure_random_words_for_session(cursor, id_sesion: int, cantidad_pruebas: int, nivel:str):
    try:
        words = cursor.execute(
            """
            SELECT id_palabra FROM palabra WHERE nivel = ?
            ORDER BY RANDOM() LIMIT ?
            """
            ,
            (nivel, cantidad_pruebas)
        )
        returned_words = words.fetchall()
        return returned_words
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener palabras aleatorias: {str(e)}"
        )


############################### ENDIPOINTS ###############################

@router.post('/configure', status_code=status.HTTP_200_OK)
async def configure_sessions(config_data: dict, doctor_data: dict = Depends(get_current_user)):
    try:
        dni_doctor = doctor_data.get("dni")
        await insert_sesion_in_db(dni_doctor, config_data)
        response_data = {
            "success": True,
            "message": "Configuración de sesiones realizada con éxito"
        }
        return JSONResponse(
            status_code = status.HTTP_200_OK,
            content = response_data
        )
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al configurar las sesiones: {str(e)}"
        )
    
@router.get('/total-words', status_code=status.HTTP_200_OK)
async def get_total_words():
    try:
        response_data = await get_total_words_from_db()
        response_data = {
            "success": True,
            "message": "Total de palabras obtenidas con éxito",
            "payload": response_data
        }
        return JSONResponse(
            status_code = status.HTTP_200_OK,
            content = response_data
        )
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener el total de palabras: {str(e)}"
        )