# Deploy to Render

This project is configured for deployment on [Render](https://render.com).

## Prerequisites
1.  A Render account.
2.  This repository pushed to GitHub/GitLab.

## Configuration (render.yaml)
The `render.yaml` file in the root directory defines the services:
-   **Web Service (`woofwoof`)**: logic backend + serves frontend.
    -   **Build**: Installs Python dependencies then builds React frontend.
    -   **Start**: Runs FastAPI backend with Gunicorn/Uvicorn.
    -   **Tech**: Python 3.11, Node 20.

## How to Deploy (Automatic)
1.  Log in to your Render Dashboard.
2.  Click **New +** -> **Blueprint**.
3.  Connect your GitHub repository (`rlacotte/woofwoof`).
4.  Render will automatically detect `render.yaml` and prompt you to apply.
5.  Click **Apply**.

## Manual Deployment without Blueprint
If you prefer to configure manually:
1.  **New Web Service**.
2.  **Repo**: `https://github.com/rlacotte/woofwoof`.
3.  **Root Directory**: `backend`.
4.  **Environment**: Python.
5.  **Build Command**: `pip install -r requirements.txt && cd ../frontend && npm install && npm run build`
6.  **Start Command**: `gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
7.  **Environment Variables**:
    -   `PYTHON_VERSION`: `3.11.6`
    -   `NODE_VERSION`: `20.11.0`

## Database Note
By default, the app uses SQLite.
-   **Ephemeral**: On Render's free tier, the disk is ephemeral. The database will be reset every time the app restarts or redeploys.
-   **Persistent**: To persist data, add a **Disk** in Render (requires paid plan) and set `DATA_DIR` to the disk mount path (e.g., `/var/data`), OR use a **PostgreSQL** database and set `DATABASE_URL`.
