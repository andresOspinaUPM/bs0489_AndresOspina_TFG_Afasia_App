import sqlite3
from sqlite3 import Error
import os

def _ejecutar_script(cursor, ruta_script):
    if not os.path.exists(ruta_script):
        (f"Error: No se encontró el archivo '{ruta_script}'")
        return False
    with open(ruta_script, 'r', encoding='utf-8') as sql_file:
        cursor.executescript(sql_file.read())
        return True

def create_database(nombre_db = "afasia_database.db", script_sql = None, seed_sql = None):
    conn = None
    actual_path = os.path.dirname(os.path.abspath(__file__))

    if script_sql is None:
        script_sql = os.path.join(actual_path, "afasia_bbdd_sqlite.sql")

    if seed_sql is None:
        seed_sql = os.path.join(actual_path, "afasia_initial_data.sql")

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

        _ejecutar_script(cursor, script_sql)

        _ejecutar_script(cursor, seed_sql)

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