from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from models.patient import PacienteBase
from database.connection import get_db_connection
import sqlite3


router = APIRouter(prefix='/paciente', tags=['paciente'])

@router.post('/registro', status_code=status.HTTP_201_CREATED)
async def registrar_paciente(paciente: PacienteBase):
    try:
        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO usuario (dni, nombre, apellidos, email, contrasena, centro_medico) 
                VALUES(?,?,?,?,?,?)
                """,
                (
                    paciente.dni,
                    paciente.nombre,
                    paciente.apellidos,
                    paciente.email,
                    paciente.contrasena,
                    paciente.centro_medico
                )
            )

            cursor.execute(
                """
                INSERT INTO paciente (dni_paciente, sexo, fecha_nacimiento, dni_medico) 
                VALUES(?,?,?,?)
                """,
                (
                    paciente.dni,
                    paciente.sexo,
                    paciente.fecha_nacimiento,
                    paciente.dni_medico
                )
            )

            response_data={
                "success":True,
                "message": "Paciente registrado con exito",
                "payload": {
                    "dni": paciente.dni,
                    "nombre": paciente.nombre,
                    "apellidos": paciente.apellidos,
                    "email": paciente.email,
                    "centro_medico": paciente.centro_medico,
                    "sexo": paciente.sexo,
                    "fecha_nacimiento": paciente.fecha_nacimiento.isoformat(),
                    "dni_medico": paciente.dni_medico
                }
            }

            conn.commit();

            return JSONResponse(
                status_code = status.HTTP_201_CREATED,
                content=response_data
            )

    except sqlite3.IntegrityError as e:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Ya existe un usuario con ese DNI o email"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = f"Error de validación: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al registrar el paciente: {str(e)}"
        )