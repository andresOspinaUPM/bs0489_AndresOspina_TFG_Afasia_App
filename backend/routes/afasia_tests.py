from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from database.connection import get_db_connection
from middleware.user_data import get_current_user
from models.test_response import TestResponse, SessionIntanceCompleted
from typing import Optional
from datetime import datetime

router = APIRouter(prefix='/afasia-tests', tags=['afasia_tests'])
database = "afasia_database.db"

async def start_session_instance(id_sesion: int, id_paciente: str) -> int:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT id_instancia FROM instancia_sesion
                WHERE id_sesion = ?
                AND id_paciente = ?
                AND completada = 0
                ORDER BY fecha_inicio DESC
                LIMIT 1
                """,
                (id_sesion, id_paciente)
            )

            instance_existing = cursor.fetchone()

            if instance_existing:
                print(f"Ya existe una instancia activa y no se ha completado: {instance_existing[0]}")
                print(f"sesion: {id_sesion}")
                await delete_incomplete_instance_session(cursor, instance_existing[0])

            cursor.execute(
                """
                INSERT INTO instancia_sesion (id_sesion, id_paciente, fecha_inicio)
                VALUES (?, ?, datetime('now', 'localtime'))
                """,
                (id_sesion, id_paciente)
            )
            id_session_instance = cursor.lastrowid
            conn.commit()
            return id_session_instance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al iniciar la instancia de la sesión: {str(e)}"
        )

async def delete_incomplete_instance_session(cursor, instance_id: int) -> None:
    cursor.execute(
        """
        DELETE FROM respuesta_prueba
        WHERE id_prueba IN (
            SELECT id_ejecucion_prueba FROM registro_ejecucion_prueba
            WHERE id_instancia = ?
        )
        """,
        (instance_id,)
    )

    cursor.execute(
        """
        DELETE FROM registro_ejecucion_prueba
        WHERE id_instancia = ?
        """,
        (instance_id,)
    )

    cursor.execute(
        """
        DELETE FROM instancia_sesion
        WHERE id_instancia = ?
        """,
        (instance_id,)
    )

async def get_predefined_test_data(id_sesion: int) -> List[dict]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT p.id_palabra, p.nombre_palabra, i.ruta_imagen, sp.orden_prueba
                FROM sesion_prueba_predefinida AS sp
                INNER JOIN palabra AS p ON p.id_palabra = sp.id_palabra
                LEFT JOIN imagen AS i ON p.id_imagen = i.id_imagen
                WHERE sp.id_sesion = ?
                """,
                (id_sesion,)
            )
            rows = cursor.fetchall()
            test_data = []
            for row in rows:
                data = {
                    "id_palabra": row[0],
                    "nombre_palabra": row[1],
                    "ruta_imagen": row[2],
                    "orden_prueba": row[3]
                }
                test_data.append(data)
            return test_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los datos de la prueba: {str(e)}"
        )

async def insert_random_test_into_prueba_aleatoria(id_session_instance: int, total_tests: int, nivel: str):
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            random_words = await get_random_words_from_db(cursor, total_tests, nivel)
            print(f"Palabras aleatorias obtenidas: {random_words}")
            orden_prueba = 1
            for (id_palabra,) in random_words:
                cursor.execute( 
                    """
                    INSERT INTO registro_prueba_aleatoria (id_instancia, id_palabra, orden_prueba)
                    VALUES(?,?,?)
                    """
                    ,(id_session_instance, id_palabra, orden_prueba)
                )
                orden_prueba += 1
            conn.commit()
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al guardar registrar las pruebas aleatorias en la base de datos: {str(e)}"
        )

async def get_random_words_from_db(cursor, total_tests: int, nivel: str) -> list:
    try:
        cursor.execute(
            """
            SELECT id_palabra FROM palabra WHERE nivel = ?
            ORDER BY RANDOM() LIMIT ?
            """,
            (nivel, total_tests)
        )
        random_words = cursor.fetchall()
        return random_words
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener palabras aleatorias: {str(e)}"
        )

async def get_random_tests_data(id_session_instance: int) -> List[dict]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT p.id_palabra, p.nombre_palabra, i.ruta_imagen, pa.orden_prueba
                FROM registro_prueba_aleatoria AS pa 
                INNER JOIN palabra AS p ON pa.id_palabra = p.id_palabra
                LEFT JOIN imagen AS i ON p.id_imagen = i.id_imagen
                WHERE pa.id_instancia = ?
                """
                ,(id_session_instance,)
            )
            rows = cursor.fetchall()
            test_data = []
            for row in rows:
                data = {
                    "id_palabra": row[0],
                    "nombre_palabra": row[1],
                    "ruta_imagen": row[2],
                    "orden_prueba": row[3]
                }
                test_data.append(data)
            return test_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los datos de la prueba: {str(e)}"
        )

# ------------ SAVE EJECUCIONES TESTS ---------------- #

async def save_test_run(id_instance: int, id_word: int) -> Optional[int]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO registro_ejecucion_prueba (id_instancia, id_palabra)
                VALUES (?,?)
                """
                ,(id_instance, id_word)
            )
            conn.commit()
            response_id = cursor.lastrowid
            return response_id
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al guardar al registrar la ejecución de la prueba en la base de datos: {str(e)}"
        )


# ------------ GET DESCRIPCIONES ---------------- #

async def get_description_categoria_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT c.descripcion FROM categoria AS c
                INNER JOIN palabra_categoria AS pc ON c.id_categoria = pc.id_categoria
                WHERE pc.id_palabra = ?
                """,
                (id_palabra,)
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la categoria de la palabra: {str(e)}"
        )

async def get_description_uso_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
            """
            SELECT u.descripcion FROM uso AS u
            INNER JOIN palabra_uso AS pu ON u.id_uso = pu.id_uso
            WHERE pu.id_palabra = ?
            """,
            (id_palabra,)
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el uso de la palabra: {str(e)}"
        )

async def get_description_accion_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
            """
            SELECT a.descripcion FROM accion AS a
            INNER JOIN palabra_accion AS pa ON a.id_accion = pa.id_accion
            WHERE pa.id_palabra = ?
            """,
            (id_palabra,)
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la accion de la palabra: {str(e)}"
        )

async def get_description_propiedad_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
            """
            SELECT p.descripcion FROM propiedad AS p
            INNER JOIN palabra_propiedad AS pp ON p.id_propiedad = pp.id_propiedad
            WHERE pp.id_palabra = ?
            """,
            (id_palabra,)
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la propiedad de la palabra: {str(e)}"
        )

async def get_description_localizacion_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
            SELECT l.descripcion FROM localizacion AS l
            INNER JOIN palabra_localizacion AS pl ON l.id_localizacion = pl.id_localizacion
            WHERE pl.id_palabra = ?
            """,
            (id_palabra,)
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la localizacion de la palabra: {str(e)}"
        )

async def get_description_asociacion_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
            """
            SELECT a.descripcion FROM asociacion AS a
            INNER JOIN palabra_asociacion AS pa ON a.id_asociacion = pa.id_asociacion
            WHERE pa.id_palabra = ?
            """,
            (id_palabra,)
            )
            row = cursor.fetchone()
            if row:
                return row[0]
            else:
                return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la asociacion de la palabra: {str(e)}"
        )

# # --------------- RESPONSE --------------- #
async def save_response(test_response: TestResponse) -> Optional[int]:
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO respuesta_prueba (id_prueba, tiempo_respuesta, respuesta_correcta )
                Values (?, ?, ?)
                """,
                (
                    test_response.id_prueba,
                    test_response.tiempo_respuesta,
                    test_response.respuesta_correcta
                )
            )
            conn.commit()
            response_id=cursor.lastrowid
            return response_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la respuesta de la prueba: {str(e)}"
        )

async def save_session_instance_as_completed(id_session_instance: int, date: str, is_completed: bool):
    print(f'BE id_intancia: {id_session_instance}, date: {date}, is_completed: {is_completed}')
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE instancia_sesion
                SET fecha_fin = ?, completada = ?
                WHERE id_instancia = ?
                """
                ,(date, is_completed, id_session_instance)
            )
            conn.commit()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la instancia de la sesison como completada: {str(e)}"
        )

async def delete_session_instance(id_session_instance: int):
    try:
        with get_db_connection(database) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT 1 FROM instancia_sesion 
                WHERE id_instancia = ?
                AND completada = 0
                """
                ,(id_session_instance,)
            )
            instance = cursor.fetchone()

            if not instance:
                return
            
            cursor.execute(
                """
                DELETE FROM instancia_sesion WHERE id_instancia = ?
                """,
                (id_session_instance,)
            )

            conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al intentar eliminar la instancia de sesión: {str(e)}"
        )

# # --------------- ENDPOINTS --------------- #

@router.post('/start-session-instance/{id_sesion}', status_code=status.HTTP_201_CREATED)
async def start_session_endpoint(id_sesion: int, current_user: dict = Depends(get_current_user)):
    try:
        id_session_instance = await start_session_instance(id_sesion, current_user.get('dni'))
        response_data = {
            "success": True,
            "message": "Sesión iniciada correctamente",
            "payload": id_session_instance
        }
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content= response_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al iniciar la sesión {e}"
        )

@router.get('/test-data/{id_sesion}', status_code=status.HTTP_200_OK)
async def start_session(id_sesion: int):
    try:

        test_data = await get_predefined_test_data(id_sesion)
        if not test_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontraron datos para la prueba proporcionada"
            )
        response_data = {
            "success": True,
            "message": "Datos de la prueba obtenidos correctamente",
            "payload": test_data
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content= response_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener los datos de la prueba: {str(e)}"
        )

@router.get('/random-test-data/{id_session_instance}/{total_tests}/{nivel}', status_code=status.HTTP_200_OK)
async def get_random_test_data(id_session_instance: int, total_tests: int, nivel: str):
    try:
        await insert_random_test_into_prueba_aleatoria(id_session_instance, total_tests, nivel)
        test_data = await get_random_tests_data(id_session_instance)
        if not test_data:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "No hay datos aleatorios para la prueba"
            )
        response_data = {
            "success": True,
            "message": "Datos aleatorios de la prueba obtenidos correctamente",
            "payload": test_data
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content = response_data
        )
    except HTTPException:
        raise HTTPException(
            status_code= status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail= "Error al obtener los datos aleatorios de la prueba"
        )

@router.get('/descriptions/{id_palabra}', status_code=status.HTTP_200_OK)
async def get_descripciones_by_palabra(id_palabra: int):
    try:
        categoria = await get_description_categoria_by_palabra(id_palabra)
        uso = await get_description_uso_by_palabra(id_palabra)
        accion = await get_description_accion_by_palabra(id_palabra)
        propiedades = await get_description_propiedad_by_palabra(id_palabra)
        localizacion = await get_description_localizacion_by_palabra(id_palabra)
        asociacion = await get_description_asociacion_by_palabra(id_palabra)

        if any(description is None for description in [categoria, uso, accion, propiedades, localizacion, asociacion]):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontraron descripciones para la palabra proporcionada"
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "success": True,
                "payload": {
                    "categoria": categoria,
                    "uso": uso,
                    "accion": accion,
                    "propiedades": propiedades,
                    "localizacion": localizacion,
                    "asociacion": asociacion
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al obtener las descripciones de la palabra: {str(e)}"
        )

@router.post('/save-current-test-run/{id_instance}/{id_word}', status_code=status.HTTP_200_OK)
async def save_current_test_run(id_instance: int, id_word: int):
    try:
        response = await save_test_run(id_instance, id_word)
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se puedo guardar correctamere el registro de la prueba actual"
            )
        response_data={
            "success":True,
            "message":"Se ha guardado correctamete el registro de la prueba que se esta ejecutando actualmente",
            "payload": response
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al guardar el registro de la prueba en ejecución {e}"
        )



@router.post('/save-response', status_code=status.HTTP_200_OK)
async def save_test_response(test_response: TestResponse, current_user: dict = Depends(get_current_user)):
    try:
        response = await save_response(test_response)
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se pudo guargar la respuesta de la prueba en la base de datos"
            )
        response_data={
            "success":True,
            "message":"Se ha guardado con exito la respuesta de la prueba en la base de datos"
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al guardar la respuesta de la prueba {e}"
        )

@router.post('/set-session-completed/{id_session_instance}', status_code=status.HTTP_200_OK)
async def save_session_as_completed(id_session_instance: int, current_user: dict = Depends(get_current_user)):
    try:
        date = datetime.now()
        date_str = date.strftime('%Y-%m-%d %H:%M:%S')
        is_completed = True
        await save_session_instance_as_completed(id_session_instance, date_str, is_completed)
        response_data={
            "success":True,
            "message":"Instancia de la sesion guardada como completada correctamente"
        }
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"BE - Error al marcar como completada la instancia de la sesion {e}"
        )

@router.delete('/remove-session-instance/{id_session_instance}', status_code=status.HTTP_200_OK)
async def remove_session_instance(id_session_instance: int, current_user: dict = Depends(get_current_user)):
    try:
        await delete_session_instance(id_session_instance)
        response_data={
            "success":True,
            "message":f"Se ha eliminado la intancia de sesión con id: {id_session_instance}"
        }
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"BE - Error al intentar eliminar la instancia de sesion {e}"
        )