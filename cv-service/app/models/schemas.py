from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class DensityLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Detection(BaseModel):
    """Single vehicle detection result."""
    class_name: str = Field(..., description="Vehicle class: car, motorcycle, bus, truck")
    confidence: float = Field(..., ge=0, le=1, description="Detection confidence")
    bbox: List[float] = Field(..., min_length=4, max_length=4, description="[x1, y1, x2, y2]")
    track_id: Optional[int] = Field(None, description="Tracking ID (if tracking enabled)")


class FrameDetectionResponse(BaseModel):
    """Response for single frame detection."""
    cars: int = 0
    bikes: int = 0
    buses: int = 0
    trucks: int = 0
    total_vehicles: int = 0
    density_level: DensityLevel = DensityLevel.LOW
    detections: List[Detection] = []


class TrafficSnapshot(BaseModel):
    """Aggregated traffic analysis result from video processing."""
    cars: int = 0
    bikes: int = 0
    buses: int = 0
    trucks: int = 0
    total_vehicles: int = 0
    density_level: DensityLevel = DensityLevel.LOW
    queue_length_meters: float = 0.0
    average_speed_kmh: float = 0.0
    frames_processed: int = 0
    total_frames: int = 0
    processing_time_seconds: float = 0.0
    frame_detections: Optional[List[FrameDetectionResponse]] = None


class AnalyzeVideoRequest(BaseModel):
    """Request body for video analysis."""
    video_url: Optional[str] = Field(None, description="URL of the video to analyze")
    sample_rate: Optional[int] = Field(None, description="Override frame sample rate")
    include_frame_details: bool = Field(False, description="Include per-frame detections")


class StreamConfig(BaseModel):
    """Configuration for live stream processing."""
    rtsp_url: str = Field(..., description="RTSP stream URL")
    sample_rate: int = Field(5, description="Process every Nth frame")
    duration_seconds: int = Field(60, description="How long to process the stream")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    service: str = "smartflow-cv-service"
    model_loaded: bool = False
    model_name: str = ""
