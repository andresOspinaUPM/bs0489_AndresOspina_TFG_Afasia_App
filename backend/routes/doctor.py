from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from models.user import UsuarioBase
from database.connection import get_db_connection
import sqlite3
from middleware.user_data import get_current_doctor

router = APIRouter(prefix='/doctor', tags=['doctor'])

async def insert_doctors_to_db(doctor: UsuarioBase):
    try:
        with get_db_connection("afasia_database.db") as conn:
            cursor = conn.cursor()

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
                    doctor.contrasena,
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
            detail = f"Error al registrar el doctor: {str(e)}"
        )


async def get_all_doctors() -> list[dict]:
    try:
        with get_db_connection("afasia_database.db") as conn:
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los doctores: {str(e)}"
        )

async def get_doctor_patients(doctor_dni: str) -> list[dict]:
    try:
        with get_db_connection("afasia_database.db") as conn:
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
                ORDER BY user.apellidos, user.nombre
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
    except Exception as e:
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
            "data": {
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

    except sqlite3.IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con ese DNI o email"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el doctor...."
        )

@router.get('/list', status_code=status.HTTP_200_OK)
async def list_doctors():
    try:
        doctors = await get_all_doctors()
        response_data = {
            "success": True,
            "message": "Lista de doctores obtenida con exito",
            "data": doctors
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de doctores: {str(e)}"
        )

@router.get('/listOfPatients', status_code=status.HTTP_200_OK)
async def list_doctor_patients(current_doctor: dict = Depends(get_current_doctor)):
    try:
        print(f"Entra al doctor.py /listOfPatients/ endpoint")
        doctor_dni = current_doctor.get("dni")
        print(f"Doctor DNI: {doctor_dni}")
        patients = await get_doctor_patients(doctor_dni)
        response_data = {
            "success": True,
            "message": "Lista de pacientes del doctor obtenida con exito",
            "data": patients
        }
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener la lista de pacientes del doctor: {str(e)}"
        )