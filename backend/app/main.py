from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .database import engine, Base
from .routers import profiles, matching, messaging, plans

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WoofWoof API",
    description="Le Tinder pour chiens - API Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes first
@app.get("/api/health")
def health():
    return {"status": "ok", "app": "WoofWoof", "version": "1.0.0"}

app.include_router(profiles.router)
app.include_router(matching.router)
app.include_router(messaging.router)
app.include_router(plans.router)

# Serve uploaded photos
uploads_path = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Serve generated puppy images
generated_images_path = os.path.join(os.path.dirname(__file__), "..", "generated_images")
os.makedirs(generated_images_path, exist_ok=True)
app.mount("/generated", StaticFiles(directory=generated_images_path), name="generated")

# Serve frontend static files if they exist (must be last)
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build")
if os.path.exists(frontend_path):
    # Serve static assets (js, css, images)
    static_path = os.path.join(frontend_path, "static")
    if os.path.exists(static_path):
        app.mount("/static", StaticFiles(directory=static_path), name="static")

    # SPA fallback: serve index.html for all non-API routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(frontend_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_path, "index.html"))
