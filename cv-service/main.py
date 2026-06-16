import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.detector import VehicleDetector
from app.config import settings
from app.models.schemas import HealthResponse

# Global detector instance (loaded once at startup)
detector = VehicleDetector(
    model_path=settings.YOLO_MODEL_PATH,
    confidence=settings.YOLO_CONFIDENCE_THRESHOLD,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load YOLO model at startup, cleanup at shutdown."""
    print("🚀 Starting SmartFlow CV Service...")

    # Create weights directory if needed
    weights_dir = os.path.dirname(settings.YOLO_MODEL_PATH)
    if weights_dir and not os.path.exists(weights_dir):
        os.makedirs(weights_dir, exist_ok=True)

    # Load YOLO model
    detector.load_model()
    print(f"✅ YOLO model ready: {detector.model_name}")

    yield

    print("👋 Shutting down CV Service...")


# ─── FastAPI App ──────────────────────────────────────────

app = FastAPI(
    title="SmartFlow CV Service",
    description="Computer Vision microservice for traffic analysis using YOLOv8",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────

from app.routes.detect import router as detect_router
from app.routes.analyze_video import router as analyze_router
from app.routes.stream import router as stream_router

app.include_router(detect_router, tags=["Detection"])
app.include_router(analyze_router, tags=["Video Analysis"])
app.include_router(stream_router, tags=["Live Stream"])


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check service health and model status."""
    return HealthResponse(
        status="healthy",
        service="smartflow-cv-service",
        model_loaded=detector.is_loaded,
        model_name=detector.model_name,
    )


# ─── Run ──────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
