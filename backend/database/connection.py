import sqlite3
from contextlib import contextmanager
from config.settings import DATABASE_PATH

@contextmanager
def get_db_connection(database_path=DATABASE_PATH):
    conn = sqlite3.connect(database_path)
    try:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.row_factory = sqlite3.Row 
        yield conn
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
