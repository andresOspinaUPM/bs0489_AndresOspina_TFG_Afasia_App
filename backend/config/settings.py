import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_PATH = os.getenv("DATABASE_PATH", str(Path.home() / "afasia_database.db"))
APP_NAME = os.getenv("APP_NAME", "API Afasia")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"