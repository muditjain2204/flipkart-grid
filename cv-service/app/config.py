from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # YOLO Configuration
    YOLO_MODEL_PATH: str = "weights/yolov8n.pt"
    YOLO_CONFIDENCE_THRESHOLD: float = 0.5
    VIDEO_FRAME_SAMPLE_RATE: int = 5  # Process every Nth frame

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True

    # Limits
    MAX_VIDEO_SIZE_MB: int = 100
    MAX_PROCESSING_TIME_SECONDS: int = 120

    class Config:
        env_file = ".env"


settings = Settings()
