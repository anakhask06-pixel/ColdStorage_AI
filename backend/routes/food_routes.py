
from flask import Blueprint, request, jsonify
from models.food_model import (
    add_food,
    get_all_food,
    advance_food_time,
    delete_food,
)

food_bp = Blueprint("food", __name__)

# Approved fruits and their default simulation shelf lives.
# These values are configurable project assumptions, not guarantees.
FRUIT_SHELF_LIFE = {
    "apple": {"name": "Apple", "hours": 72},
    "banana": {"name": "Banana", "hours": 72},
    "kiwi": {"name": "Kiwi", "hours": 120},
    "mango": {"name": "Mango", "hours": 120},
    "orange": {"name": "Orange", "hours": 168},
    "grapes": {"name": "Grapes", "hours": 168},
    "strawberry": {"name": "Strawberry", "hours": 48},
    "pineapple": {"name": "Pineapple", "hours": 120},
}


@food_bp.route("/api/food", methods=["GET"])
def list_food():
    try:
        food_items = get_all_food()

        for item in food_items:
            for key, value in item.items():
                if hasattr(value, "isoformat"):
                    item[key] = value.isoformat()

        return jsonify(food_items), 200

    except Exception as e:
        print(f"Error fetching food items: {e}")
        return jsonify({
            "error": "Could not retrieve food items"
        }), 500


@food_bp.route("/api/food", methods=["POST"])
def create_food():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be valid JSON"
        }), 400

    name = data.get("name")
    food_type = data.get("food_type", "Fruit")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Please select a fruit"}), 400

    # Find the fruit in the approved list.
    fruit = FRUIT_SHELF_LIFE.get(name.strip().casefold())

    if fruit is None:
        return jsonify({
            "error": "Unsupported fruit. Choose a fruit from the approved list."
        }), 400

    if (
        not isinstance(food_type, str)
        or food_type.strip().casefold() != "fruit"
    ):
        return jsonify({
            "error": "Food type must be Fruit"
        }), 400

    # Shelf life is decided by the backend.
    # Ignore any shelf_life_hours value supplied by the frontend.
    canonical_name = fruit["name"]
    shelf_life_hours = fruit["hours"]

    try:
        food_id = add_food(
            canonical_name,
            "Fruit",
            shelf_life_hours
        )

        return jsonify({
            "message": "Food added successfully",
            "id": food_id,
            "name": canonical_name,
            "shelf_life_hours": shelf_life_hours
        }), 201

    except Exception as e:
        print(f"Error adding food: {e}")
        return jsonify({
            "error": "Could not add food item"
        }), 500


@food_bp.route("/api/food/<int:food_id>", methods=["DELETE"])
def remove_food(food_id):
    try:
        deleted = delete_food(food_id)

        if not deleted:
            return jsonify({
                "error": "Food item not found"
            }), 404

        return jsonify({
            "message": "Food item deleted successfully",
            "id": food_id
        }), 200

    except Exception as e:
        print(f"Error deleting food: {e}")
        return jsonify({
            "error": "Could not delete food item"
        }), 500


@food_bp.route("/api/food/advance-time", methods=["POST"])
def advance_time():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Request body must be valid JSON"
        }), 400

    hours = data.get("hours")

    if (
        isinstance(hours, bool)
        or not isinstance(hours, int)
        or not 1 <= hours <= 720
    ):
        return jsonify({
            "error": "hours must be an integer from 1 to 720"
        }), 400

    try:
        updated_foods = advance_food_time(hours)

        return jsonify({
            "message": f"Advanced simulated time by {hours} hours",
            "updated_foods": updated_foods
        }), 200

    except Exception as e:
        print(f"Error advancing simulation time: {e}")
        return jsonify({
            "error": "Could not advance simulation"
        }), 500
