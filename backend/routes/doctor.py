import sqlite3
from utils.password_utils import hash_password
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from models.user import UsuarioBase
from database.connection import get_db_connection
from middleware.user_data import get_current_user

router = APIRouter(prefix='/doctor', tags=['doctor'])

async def insert_doctors_to_db(doctor: UsuarioBase):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            contrasena_hasheada = hash_password(doctor.contrasena)

            cursor.execute(
                """
                INSERT INTO usuario (dni, nombre, apellidos, email, contrasena, centro_medico) 
                VALUES(?,?,?,?,?,?)
                """,
                (
                    doctor.dni,
                    doctor.nombre,
                    doctor.apellidos,
                    doctor.email,
                    contrasena_hasheada,
                    doctor.centro_medico
                )
            )

            cursor.execute(
                """
                INSERT INTO medico (dni_medico)
                VALUES(?)
                """,
                (doctor.dni,)
            )

            conn.commit()
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
            detail = f"Error al registrar el doctor: {str(e)}"
        )


async def get_all_doctors() -> list[dict]:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT 
                    user.dni,
                    user.nombre,
                    user.apellidos
                FROM usuario AS user
                JOIN medico AS doc ON user.dni = doc.dni_medico
                ORDER BY user.apellidos, user.nombre
                """
            )

            rows = cursor.fetchall()
            doctores = []
            for row in rows:
                doctor = {
                    "dni": row[0],
                    "nombre": row[1],
                    "apellidos": row[2]
                }
                doctores.append(doctor)
            
            return doctores
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los doctores: {str(e)}"
        )

async def get_doctor_patients(doctor_dni: str) -> list[dict]:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT 
                    user.dni,
                    user.nombre,
                    user.apellidos,
                    user.email
                FROM usuario AS user
                JOIN paciente AS pat ON user.dni = pat.dni_paciente
                WHERE pat.dni_medico = ?
                ORDER BY user.nombre, user.apellidos
                """,
                (doctor_dni,)
            )

            rows = cursor.fetchall()
            pacientes = []
            for row in rows:
                paciente = {
                    "dni": row[0],
                    "nombre": row[1],
                    "apellidos": row[2],
                    "email": row[3]
                }
                pacientes.append(paciente)
            
            return pacientes
    except HTTPException:
        raise
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los pacientes del doctor: {str(e)}"
        )

############################### ENDIPOINTS ###############################

@router.post('/registro', status_code=status.HTTP_201_CREATED)
async def register_doctor(doctor: UsuarioBase):

    try:
        await insert_doctors_to_db(doctor)
        response_data = {
            "success": True,
            "message": "Doctor registrado con exito",
            "payload": {
                "dni": doctor.dni,
                "nombre": doctor.nombre,
                "apellidos": doctor.apellidos,
                "email": doctor.email,
                "centro_medico": doctor.centro_medico
            }
        }

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=response_data
        )

    except HTTPException:
        raise

@router.get('/list', status_code=status.HTTP_200_OK)
async def list_doctors():
    try:
        doctors = await get_all_doctors()
        response_data = {
            "success": True,
            "message": "Lista de doctores obtenida con exito",
            "payload": doctors
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data
        )
    
    except HTTPException:
        raise

@router.get('/listOfPatients', status_code=status.HTTP_200_OK)
async def list_doctor_patients(current_doctor: dict = Depends(get_current_user)):
    try:
        if current_doctor.get("user_rol") != "doctor":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo los doctores pueden acceder a una lista de pacientes"
            )
        doctor_dni = current_doctor.get("dni")
        patients = await get_doctor_patients(doctor_dni)
        response_data = {
            "success": True,
            "message": "Lista de pacientes del doctor obtenida con exito",
            "payload": patients
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data
        )
    
    except HTTPException:
        raise