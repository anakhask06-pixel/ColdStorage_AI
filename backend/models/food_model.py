
from datetime import datetime
from database.connection import get_connection

# Simulation speed: 1 simulated hour per 5 real seconds.
REAL_SECONDS_PER_SIMULATED_HOUR = 5


def update_food_state(cursor, food_id, elapsed_hours):
    """Update the food's age and calculate its freshness state."""
    cursor.execute(
        """
        SELECT shelf_life_hours
        FROM food_items
        WHERE id = %s
        """,
        (food_id,)
    )
    food = cursor.fetchone()

    if food is None:
        return None

    shelf_life = food["shelf_life_hours"]

    if elapsed_hours >= shelf_life:
        state = "Spoiled"
    elif elapsed_hours >= shelf_life / 3:
        state = "Aging"
    else:
        state = "Fresh"

    cursor.execute(
        """
        UPDATE food_items
        SET elapsed_hours = %s,
            freshness_state = %s
        WHERE id = %s
        """,
        (elapsed_hours, state, food_id)
    )

    return state


def add_food(name, food_type, shelf_life_hours):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO food_items
                (name, food_type, shelf_life_hours,
                 elapsed_hours, freshness_state, last_simulated_at)
            VALUES (%s, %s, %s, 0, 'Fresh', NOW())
            """,
            (name, food_type, shelf_life_hours)
        )

        connection.commit()
        return cursor.lastrowid

    except Exception:
        if connection is not None:
            connection.rollback()
        raise

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


def get_all_food():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Lock rows while calculating elapsed time to avoid
        # conflicting with simultaneous manual time advances.
        connection.start_transaction()

        cursor.execute(
            """
            SELECT id, elapsed_hours, shelf_life_hours,
                   last_simulated_at
            FROM food_items
            ORDER BY id
            FOR UPDATE
            """
        )
        foods = cursor.fetchall()

        now = datetime.now()

        for food in foods:
            last_time = food["last_simulated_at"]

            if last_time is None:
                cursor.execute(
                    """
                    UPDATE food_items
                    SET last_simulated_at = %s
                    WHERE id = %s
                    """,
                    (now, food["id"])
                )
                continue

            elapsed_seconds = max(
                0,
                (now - last_time).total_seconds()
            )

            hours_to_add = int(
                elapsed_seconds // REAL_SECONDS_PER_SIMULATED_HOUR
            )

            if hours_to_add > 0:
                new_elapsed = food["elapsed_hours"] + hours_to_add
                update_food_state(cursor, food["id"], new_elapsed)

                cursor.execute(
                    """
                    UPDATE food_items
                    SET last_simulated_at =
                        DATE_ADD(last_simulated_at, INTERVAL %s SECOND)
                    WHERE id = %s
                    """,
                    (
                        hours_to_add * REAL_SECONDS_PER_SIMULATED_HOUR,
                        food["id"]
                    )
                )

        connection.commit()

        cursor.execute(
            """
            SELECT *
            FROM food_items
            ORDER BY id DESC
            """
        )

        return cursor.fetchall()

    except Exception:
        if connection is not None:
            connection.rollback()
        raise

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()


def advance_food_time(hours):
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        connection.start_transaction()

        cursor.execute(
            """
            SELECT id, elapsed_hours, shelf_life_hours
            FROM food_items
            FOR UPDATE
            """
        )
        foods = cursor.fetchall()

        updated_foods = []

        for food in foods:
            elapsed = food["elapsed_hours"] + hours
            state = update_food_state(cursor, food["id"], elapsed)

            # Reset the automatic clock baseline so manual
            # advancement does not immediately get counted twice.
            cursor.execute(
                """
                UPDATE food_items
                SET last_simulated_at = NOW()
                WHERE id = %s
                """,
                (food["id"],)
            )

            updated_foods.append({
                "id": food["id"],
                "elapsed_hours": elapsed,
                "freshness_state": state
            })

        connection.commit()
        return updated_foods

    except Exception:
        if connection is not None:
            connection.rollback()
        raise

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()



def delete_food(food_id):
    """Delete one food item by its database ID."""
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM food_items WHERE id = %s",
            (food_id,)
        )

        deleted = cursor.rowcount
        connection.commit()
        return deleted > 0

    except Exception:
        if connection is not None:
            connection.rollback()
        raise

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None:
            connection.close()
