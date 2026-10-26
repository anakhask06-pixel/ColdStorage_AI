# Import the model functions.
from models.sensor_model import insert_sensor_data, get_all_sensor_data


def save_sensor_data(temperature, humidity):
    """
    Validate sensor readings and save them to the database.
    """

    # Check temperature
    if not isinstance(temperature, (int, float)) or isinstance(temperature, bool):
        raise ValueError("Temperature must be a number.")

    # Check humidity
    if not isinstance(humidity, (int, float)) or isinstance(humidity, bool):
        raise ValueError("Humidity must be a number.")

    # Humidity range
    if humidity < 0 or humidity > 100:
        raise ValueError("Humidity must be between 0 and 100.")

    # Temperature range
    if temperature < -20 or temperature > 60:
        raise ValueError("Temperature must be between -20 and 60.")

    # Save to database
    insert_sensor_data(temperature, humidity)

    return {
        "message": "Sensor data stored successfully."
    }


def fetch_sensor_data():
    """
    Return all stored sensor readings.
    """
    return get_all_sensor_data()