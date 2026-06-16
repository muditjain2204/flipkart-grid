from fastapi import APIRouter, HTTPException
from app.models.schemas import StreamConfig

router = APIRouter()


@router.post("/stream/start")
async def start_stream(config: StreamConfig):
    """
    Start processing a live RTSP camera stream.

    NOTE: This is a stub for Phase 2 enhancement.
    Live stream processing requires background workers (asyncio tasks)
    which will be implemented after the hackathon MVP.
    """
    return {
        "status": "not_implemented",
        "message": "Live stream processing is a Phase 2 feature. Use /analyze-video for now.",
        "config_received": config.model_dump(),
    }


@router.post("/stream/stop")
async def stop_stream():
    """Stop the currently running stream processor."""
    return {
        "status": "not_implemented",
        "message": "No active stream to stop. Live streaming is a Phase 2 feature.",
    }


@router.get("/stream/latest")
async def get_latest_snapshot():
    """Get the latest traffic snapshot from a running stream."""
    raise HTTPException(
        status_code=501,
        detail="Live streaming not yet implemented. Use /analyze-video endpoint.",
    )
