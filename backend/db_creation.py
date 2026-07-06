import sqlite3
from sqlite3 import Error
import os

def create_database(nombre_db = "afasia_database.db", script_sql = None):
    conn = None

    if script_sql is None:
        actual_path = os.path.dirname(os.path.abspath(__file__))
        script_sql = os.path.join(actual_path, "afasia_bbdd_sqlite.sql")

    if not os.path.exists(script_sql):
        print(f"El script SQL no existe en la ruta: {script_sql}")
        return False

    if os.path.exists(nombre_db):
        print(f"La base de datos {nombre_db} ya existe.")
        return False

    try:
        conn = sqlite3.connect(nombre_db, isolation_level=None)
        print(f"Conexión a la base de datos {nombre_db} exitosa.")

        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")

        with open(script_sql, 'r', encoding = 'utf-8') as sql_file:
            script = sql_file.read()
            cursor.executescript(script)

            conn.close()
            return True

    except sqlite3.Error as e:
        print(f"Error al crear la base de datos: {e}")
        if conn:
            conn.close()
        return False
    except Exception as e:
        print(f"Error inesperado: {e}")
        if conn:
            conn.close()
        return False

if __name__ == "__main__":
    create_database()