
import random
import time

from services.sensor_service import save_sensor_data


# Generate and save one reading every 10 seconds.
SIMULATION_INTERVAL_SECONDS = 10


def generate_sensor_reading():
    """Generate a realistic example temperature and humidity reading."""

    temperature = round(random.uniform(3.0, 12.0), 2)
    humidity = round(random.uniform(60.0, 85.0), 2)

    return temperature, humidity


def run_simulator():
    print("Cold Storage Sensor Simulator Started!")
    print("Generating a new reading every 5 seconds.")
    print("Press Ctrl+C to stop the simulator.\n")

    try:
        while True:
            temperature, humidity = generate_sensor_reading()

            try:
                save_sensor_data(temperature, humidity)

                print(
                    f"Saved reading | "
                    f"Temperature: {temperature} °C | "
                    f"Humidity: {humidity}%"
                )

            except Exception as error:
                print(f"Could not save sensor reading: {error}")

            time.sleep(SIMULATION_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\nSensor simulator stopped.")


if __name__ == "__main__":
    run_simulator()
