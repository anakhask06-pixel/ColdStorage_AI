# AI-Based Intelligent Cold Storage Monitoring System

A simulation-based project combining environmental sensor data, AI-based anomaly detection, temperature prediction, food freshness simulation, and a React dashboard.

## Project Features

- Environmental monitoring for temperature and humidity.
- AI-based anomaly detection and temperature prediction.
- Food inventory and simulated freshness tracking.
- REST API endpoints using Flask.
- MySQL database integration.
- React dashboard with Home, Live Monitoring, Food Simulation, Alerts, Predictions, and Reports pages.

## Project Structure

- `backend/` — Flask application, API routes, database connection, and sensor simulator.
- `frontend/` — React and Vite dashboard.
- `ai_inference.py` — AI inference functions.
- `models/` — Trained model files managed using Git LFS.
- `dataset/`, `preprocessing/`, `training/`, and `notebooks/` — AI-related project resources.

## Requirements

- Python 3.13 or a compatible Python version for the installed dependencies.
- Node.js and npm.
- MySQL Server.
- Git and Git LFS.

## Backend Setup

From the repository root, run:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install -r backend\requirements.txt
```

Create your local `.env` file by copying the template:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your own MySQL credentials. Never commit `.env`.

Ensure the `cold_storage_db` database and required tables have been created before using database-backed endpoints. Database schema and initialization instructions should be added when the project's SQL setup is available.

Start the backend:

```powershell
Set-Location backend
python app.py
```

The backend normally runs at `http://127.0.0.1:5000`.

## Frontend Setup

Open a second terminal at the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

For a production build:

```powershell
npm run build
```

## AI Model Files

The trained `.pkl` models are stored using Git LFS. Install Git LFS and pull the model files after cloning:

```powershell
git lfs install
git lfs pull
```

If model files appear as small text pointer files, the actual model files have not been downloaded successfully.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Backend status |
| GET, POST | `/api/sensor-data` | Read or submit sensor readings |
| GET, POST | `/api/food` | Read or add food items |
| DELETE | `/api/food/<food_id>` | Delete a food item |
| POST | `/api/food/advance-time` | Advance the food freshness simulation |
| POST | `/api/ai/analyze` | Analyze temperature and humidity |

## Project Scope

This is a software simulation and AI integration project. Sensor readings and food aging can be simulated; real ESP32 hardware and camera-based freshness inspection are not required for the current software demonstration. AI predictions are model outputs and should not be interpreted as guaranteed future measurements.

## Security Notes

- Keep `.env`, passwords, and other private credentials out of Git.
- Use `.env.example` only as a template without real credentials.
- Do not commit virtual environments, `node_modules`, or generated build files.
