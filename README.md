# AFASIA-APP

Aplicación web para la gestión y realización de pruebas/sesiones de rehabilitación dirigidas a pacientes con afasia, con seguimiento por parte de médicos.

> TFG - Ingeniería del Software - UPM

## Stack del proyecto

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Python + FastAPI
- **Base de datos:** SQLite

## Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Python 3.13** (probado con 3.13.7)
- **Node.js** (recomendado 18 o superior) y **npm**

## Instalación y ejecución

### 1. Clonar el repositorio

```
git clone <url-del-repositorio>
cd AFASIA-APP
```

### 2. Configuración de las variables de entorno (Backend)

El backend requiere un archivo `.env` con las claves de configuración, por razones de seguridad no se incluye este archivo en el repositorio, pero se proporciona una plantilla llamada `.env.example` que se encuentra dentro de la carpeta `\backend`.

### 3. Backend (FastAPI)

```
cd backend
pip install -r requirements.txt
```

Levantar el servidor:

```
python3 main.py
```

El backend quedará disponible en:

```
http://localhost:8000
```

> La base de datos SQLite (`afasia_database.db`) se crea automáticamente en el disco interno del sistema (home) al arrancar el servidor por primera vez, a partir del script `afasia_bbdd_sqlite.sql`. Si el archivo `afasia_database.db` ya existe, no se vuelve a crear.

### 3. Frontend (React + Vite)

En otra terminal, desde la raíz del proyecto:

```
cd frontend
npm install
npm run dev
```

El frontend quedará disponible en la URL que indique la terminal (por defecto suele ser `http://localhost:5173`).

## Notas
* No se han usado datos reales de pacientes ni médicos durante el desarrollo y las pruebas.
* Las claves de configuración se gestionan mediante variables de entorno (archivo `.env`) siguiendo las buenas prácticas de separación entre configuración y código fuente.