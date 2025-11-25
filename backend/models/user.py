from pydantic import BaseModel, EmailStr, Field, validator
import re
from datetime import date

class UsuarioBase(BaseModel):
    dni: str = Field(..., min_length=9, max_length=20, description="DNI/NIE del usuario")
    nombre: str = Field(..., min_length=1, max_length=50, description="Nombre del usuario")
    apellidos: str = Field(..., min_length=1, max_length=50, description="Apellidos del usuario")
    email: str = Field(..., description="Email del usuario")
    centro_medico: str = Field(..., min_length=1, max_length=100, description="Centro médico del usuario")
    contrasena: str = Field(..., min_length=8, max_length=100, description="Contraseña del usuario")

    @validator('dni')
    def validate_dni(cls, value):
        print(f"Validando DNI: '{value}'")
        value = value.strip().upper()
        if not re.match(r'^([0-9]{8}|[XYZ][0-9]{7})[A-Z]$', value):
            raise ValueError("DNI/NIE inválido")
        return value

    @validator('email')
    def validate_email(cls, value):
        print(f"Validando email: '{value}'")
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise ValueError("Email inválido")
        return value

    @validator('contrasena')
    def validate_contrasena(cls, value):
        print(f"Validando contraseña: '{value}'")
        if len(value) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return value
        
    @validator('nombre', 'apellidos')
    def validate_nombre_apellido(cls, value):
        print(f"Validando nombre/apellido: '{value}'")
        if any(char.isdigit() for char in value):
            raise ValueError("El nombre y los apellidos no pueden contener números")
        if not value.replace(" ", "").isalpha():
            raise ValueError("El nombre y los apellidos solo pueden contener letras y espacios")
        return value     