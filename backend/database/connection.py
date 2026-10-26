import mysql.connector
from mysql.connector import Error

from config import MYSQL_CONFIG


def get_connection():
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        return connection
    except Error as e:
        print(f"MySQL connection error: {e}")
        raise
