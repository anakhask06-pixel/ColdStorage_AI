# Import get_connection from our database module.
from database.connection import get_connection


def insert_sensor_data(temperature, humidity):
    """
    Save a new sensor reading to the sensor_data table.
    """
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO sensor_data (temperature, humidity)
            VALUES (%s, %s)
        """

        cursor.execute(query, (temperature, humidity))
        connection.commit()

    except Exception:
        if connection is not None:
            connection.rollback()
        raise

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


def get_all_sensor_data():
    """
    Fetch all sensor readings from the database.
    Returns the newest records first.
    """
    connection = None
    cursor = None

    try:
        connection = get_connection()

        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM sensor_data
            ORDER BY id DESC
        """

        cursor.execute(query)

        result = cursor.fetchall()

        return result

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()