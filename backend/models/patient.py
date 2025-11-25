from datetime import date
from .user import UsuarioBase
from pydantic import Field, validator

class PacienteBase(UsuarioBase):
    sexo: str = Field(..., min_length=1, max_length=10, description="Sexo del paciente")
    fecha_nacimiento: date = Field(..., description="Fecha de nacimiento del paciente")
    dni_medico: str = Field(..., min_length=1, max_length=20, description="DNI del médico responsable")
    
    @validator('fecha_nacimiento')
    def validate_birth_date(cls, value):
        if not isinstance(value, date):
            raise ValueError('Fecha de nacimiento inválida')
        if value.year < 1900:
            raise ValueError('Fecha de nacimiento no puede ser anterior a 1900')
        if value.month < 1 or value.month > 12:
            raise ValueError('Mes de nacimiento inválido')
        if value.day < 1 or value.day > 31:
            raise ValueError('Día de nacimiento inválido')
        
        today = date.today()
        if value > today:
            raise ValueError('La fecha de nacimiento no puede ser futura')
        if today.year - value.year > 120:
            raise ValueError('Fecha de nacimiento no válida (mayor a 120 años)')
        return value