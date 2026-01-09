from pydantic import BaseModel
from datetime import datetime

class TestResponse(BaseModel):
  id_prueba: int
  fecha_respuesta: datetime
  tiempo_respuesta: int
  respuesta_correcta: bool

  
