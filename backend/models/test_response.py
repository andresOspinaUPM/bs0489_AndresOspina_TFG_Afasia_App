from pydantic import BaseModel
from datetime import datetime

class TestResponse(BaseModel):
  id_prueba: int
  tiempo_respuesta: int
  respuesta_correcta: bool

class SessionIntanceCompleted(BaseModel):
  fecha_completada: datetime
  completada: bool
