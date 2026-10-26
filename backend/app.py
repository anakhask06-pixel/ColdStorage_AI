
from flask import Flask
from flask_cors import CORS

from routes import register_routes

# Create the Flask application
app = Flask(__name__)

# Allow the React development server to access the API
CORS(app, resources={
    r"/api/*": {"origins": "http://localhost:5173"}
})

register_routes(app)

# Run the application
if __name__ == "__main__":
    app.run(debug=True)
