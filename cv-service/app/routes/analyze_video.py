import os
import time
import tempfile
import numpy as np
import cv2
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import Optional
from app.models.schemas import TrafficSnapshot, AnalyzeVideoRequest, DensityLevel
from app.config import settings

router = APIRouter()


@router.post("/analyze-video", response_model=TrafficSnapshot)
async def analyze_video(
    video: Optional[UploadFile] = File(None),
    video_url: Optional[str] = Body(None, embed=True),
    sample_rate: Optional[int] = Body(None, embed=True),
    include_frame_details: bool = Body(False, embed=True),
):
    """
    Analyze a complete video for traffic metrics.

    Accepts either:
    - A video file upload (multipart)
    - A video URL (JSON body)

    Returns: Aggregated traffic snapshot with vehicle counts, density,
    queue length, and average speed.
    """
    from main import detector
    from app.core.tracker import VehicleTracker
    from app.core.density import DensityEstimator
    from app.core.speed import SpeedEstimator
    from app.core.queue import QueueEstimator
    from app.utils.video import extract_frames, get_video_info, download_video

    start_time = time.time()
    rate = sample_rate or settings.VIDEO_FRAME_SAMPLE_RATE
    temp_path = None

    try:
        # Get video file path
        if video is not None:
            # Save uploaded file to temp
            suffix = os.path.splitext(video.filename or ".mp4")[1]
            fd, temp_path = tempfile.mkstemp(suffix=suffix, prefix="smartflow_")
            with os.fdopen(fd, "wb") as f:
                contents = await video.read()
                f.write(contents)
            video_path = temp_path

        elif video_url:
            # Download from URL
            temp_path = await download_video(video_url)
            video_path = temp_path

        else:
            raise HTTPException(
                status_code=400,
                detail="Provide either a video file or video_url",
            )

        # Get video info
        info = get_video_info(video_path)

        # Initialize pipeline components
        tracker = VehicleTracker()
        density_estimator = DensityEstimator()
        speed_estimator = SpeedEstimator(fps=info["fps"])
        queue_estimator = QueueEstimator()

        frames_processed = 0
        total_detections_per_frame = []

        # Process frames
        for frame_idx, frame in extract_frames(video_path, sample_rate=rate):
            # Check timeout
            elapsed = time.time() - start_time
            if elapsed > settings.MAX_PROCESSING_TIME_SECONDS:
                print(f"⚠️ Processing timeout after {elapsed:.1f}s, stopping early")
                break

            # Detect vehicles
            detections = detector.detect_frame(frame)

            # Track vehicles
            tracked = tracker.update(detections, frame)

            # Estimate speed
            speed = speed_estimator.estimate(frame, tracked if tracked else detections)

            # Estimate queue
            queue_estimator.estimate(
                tracked if tracked else detections,
                speed,
                frame_height=frame.shape[0],
            )

            total_detections_per_frame.append(len(detections))
            frames_processed += 1

        # Aggregate results
        unique_counts = tracker.get_unique_counts()
        avg_speed = speed_estimator.get_average_speed()
        avg_queue = queue_estimator.get_average_queue()

        # Calculate average density
        avg_detections_per_frame = (
            sum(total_detections_per_frame) / len(total_detections_per_frame)
            if total_detections_per_frame
            else 0
        )
        density_level = density_estimator.estimate(
            [{}] * int(avg_detections_per_frame)
        )

        processing_time = time.time() - start_time

        return TrafficSnapshot(
            cars=unique_counts["cars"],
            bikes=unique_counts["bikes"],
            buses=unique_counts["buses"],
            trucks=unique_counts["trucks"],
            total_vehicles=unique_counts["total"],
            density_level=DensityLevel(density_level),
            queue_length_meters=avg_queue,
            average_speed_kmh=avg_speed,
            frames_processed=frames_processed,
            total_frames=info["total_frames"],
            processing_time_seconds=round(processing_time, 2),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except OSError:
                pass
