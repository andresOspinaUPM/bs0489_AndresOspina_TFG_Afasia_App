import sqlite3
from utils.password_utils import hash_password
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from models.patient import PacienteBase
from database.connection import get_db_connection


router = APIRouter(prefix='/paciente', tags=['paciente'])

@router.post('/registro', status_code=status.HTTP_201_CREATED)
async def registrar_paciente(paciente: PacienteBase):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT 1 FROM medico WHERE dni_medico = ?
                """,
                (paciente.dni_medico,)
            )
            if cursor.fetchone() is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="el dni del medico seleccionado no esta en la base de datos"
                )

            contrasena_hasheada = hash_password(paciente.contrasena)

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
                    contrasena_hasheada,
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
    except HTTPException:
        raise
    
    except sqlite3.IntegrityError as e:
        error_message = str(e).lower()
        if 'email' in error_message:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con ese email"
        )
        elif 'dni' in error_message:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con ese DNI"
        )
        else:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con esos datos"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = f"Error de validación: {str(e)}"
        )

    except sqlite3.Error as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Error al registrar el paciente: {str(e)}"
        )