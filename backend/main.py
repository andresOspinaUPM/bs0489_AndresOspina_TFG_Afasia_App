from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import doctor, patient, auth, afasia_tests, configuration_sessions, afasia_tests_sessions
from db_creation import create_database
from config.settings import APP_NAME, DEBUG

@asynccontextmanager
async def lifespan(app: FastAPI):
    success = create_database()
    if success:
        print("Base de datos creada con éxito.")
    else:
        print("Error al crear la base de datos.")
    yield

app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
    description="API para la gestión de pacientes con afasia - TFG - Ingeniería del Software - UPM",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(auth.router)
app.include_router(afasia_tests.router)
app.include_router(configuration_sessions.router)
app.include_router(afasia_tests_sessions.router)

@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Afasia"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=DEBUG)