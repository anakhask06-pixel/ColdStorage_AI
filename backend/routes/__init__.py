
from routes.home_routes import home_bp
from routes.sensor_routes import sensor_bp
from routes.food_routes import food_bp
from routes.ai_routes import ai_bp


def register_routes(app):
    app.register_blueprint(home_bp)
    app.register_blueprint(sensor_bp)
    app.register_blueprint(food_bp)
    app.register_blueprint(ai_bp)
