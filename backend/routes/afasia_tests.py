from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import JSONResponse
from database.connection import get_db_connection
from middleware.user_data import get_current_user
from typing import Optional

router = APIRouter(prefix='/afasia-tests', tags=['afasia_tests'])

async def start_session_instance(id_sesion: int, id_paciente: str) -> int:
    try:
        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()
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

async def get_predefined_test_data(id_sesion: int) -> Optional[dict]:
    try:
        with get_db_connection("afasia_database.db") as conn:
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
        with get_db_connection("afasia_database.db") as conn:
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
            detail = f"Error al guardar registrar las pruebas aleatorias en la base de datos"
        )

async def get_random_words_from_db(cursor, total_tests: int, nivel: str) -> list:  # ← Cambiado a list
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

async def get_random_tests_data(id_session_instance: int) -> Optional[dict]:
    try:
        with get_db_connection("afasia_database.db") as conn:
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


# ------------ GET DESCRIPCIONES ---------------- #

async def get_description_categoria_by_palabra(id_palabra: int) -> Optional[str]:
    try:
        with get_db_connection("afasia_database.db") as conn:
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
        with get_db_connection("afasia_database.db") as conn:
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
        with get_db_connection("afasia_database.db") as conn:
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
        with get_db_connection("afasia_database.db") as conn:
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
        with get_db_connection("afasia_database.db") as conn:
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
        with get_db_connection("afasia_database.db") as conn:
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
            detail ="Error al iniciar la sesión"
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
            detail ="Error al obtener los datos de la prueba"
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
            detail ="Error al obtener las descripciones de la palabra"
        )

# async def get_sesion() -> list[dict]:
#     try:
#         with get_db_connection("afasia_database.db") as conn:
#             cursor = conn.cursor()
#             cursor.execute(
#                 """
#                 SELECT
#                     id_sesion,
#                     nivel,
#                     cantidad_pruebas,
#                     imagenes_aleatorias
#                 FROM sesion
#                 """
#             )

#             rows = cursor.fetchall()
#             data_sesion = []
#             for row in rows:
#                 sesion = {
#                     "id_sesion": row[0],
#                     "nivel": row[1],
#                     "cantidad_pruebas": row[2]
#                 }
#                 data_sesion.append(sesion)
#             return data_sesion
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error al obtener las sesiones: {str(e)}"
#         )

# async def get_pruebas_by_sesion(id_sesion: int) -> list[int]:
#     try:
#         with get_db_connection("afasia_database.db") as conn:
#             cursor = conn.cursor()
#             cursor.execute(
#             """
#             SELECT p.id_prueba, p.id_palabra, p.tiempo_limite_por_prueba 
#             FROM sesion_prueba AS sp
#             INNER JOIN prueba AS p ON sp.id_prueba = p.id_prueba
#             WHERE sp.id_sesion = ?
#             """,
#             (id_sesion,)
#             )
#             rows = cursor.fetchall()
#             data_prueba = []
#             for row in rows:
#                 prueba = {
#                     "id_prueba": row[0],
#                     "id_palabra": row[1],
#                     "tiempo_limite_por_prueba": row[2]
#                 }
#                 data_prueba.append(prueba)
#             return data_prueba
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error al obtener las pruebas de la sesion: {str(e)}"
#         )
    
# async def get_palabra_name_and_image(id_palabra: int) -> Optional[dict]:
#     try:
#         with get_db_connection("afasia_database.db") as conn:
#             cursor = conn.cursor()
#             cursor.execute(
#             """
#             SELECT p.nombre_palabra, i.ruta_imagen
#             FROM palabra AS p
#             Inner JOIN imagen AS i ON p.id_imagen = i.id_imagen
#             WHERE p.id_palabra = ?
#             """,
#             (id_palabra,)
#             )
#             row = cursor.fetchone()
#             if row:
#                 return {
#                     "nombre_palabra": row[0],
#                     "ruta_imagen": row[1]
#                 }
#             else:
#                 return None
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error al obtener las palabras de la prueba: {str(e)}"
#         )
    


# # --------------- ENDPOINTS --------------- #

# @router.get('/sesiones', status_code=status.HTTP_200_OK)
# async def list_sesiones():
#     try:
#         sesiones = await get_sesion()
#         if not sesiones:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="No se encontraron sesiones"
#             )
#         return JSONResponse(
#             status_code=status.HTTP_200_OK,
#             content={
#                 "success": True,
#                 "payload": sesiones
#             }
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail ="Error al obtener las sesiones"
#         )

# @router.get('/pruebas/{id_sesion}', status_code=status.HTTP_200_OK)
# async def list_pruebas_by_sesion(id_sesion: int):
#     try:
#         pruebas = await get_pruebas_by_sesion(id_sesion)
#         if not pruebas:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="No se encontraron pruebas para la sesion proporcionada"
#             )
#         return JSONResponse(
#             status_code=status.HTTP_200_OK,
#             content={
#                 "success": True,
#                 "payload": pruebas
#             }
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail ="Error al obtener las pruebas de la sesion"
#         )

# @router.get('/palabra/{id_palabra}', status_code=status.HTTP_200_OK)
# async def list_palabras_for_prueba(id_palabra: int):
#     try:
#         palabra = await get_palabra_name_and_image(id_palabra)
#         if palabra is None:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="No se encontraron palabras para la prueba proporcionada"
#             )

#         return JSONResponse(
#             status_code=status.HTTP_200_OK,
#             content={
#                 "success": True,
#                 "payload": palabra
#             }
#         )
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail ="Error al obtener las palabras de la prueba"
#         )

