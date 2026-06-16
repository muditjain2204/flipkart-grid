import cv2
import os
import tempfile
from typing import Generator, Tuple
import numpy as np
import httpx


def extract_frames(
    video_path: str,
    sample_rate: int = 5,
) -> Generator[Tuple[int, np.ndarray], None, None]:
    """
    Extract frames from a video file at a given sample rate.

    Args:
        video_path: Path to the video file
        sample_rate: Yield every Nth frame (1 = every frame)

    Yields:
        Tuple of (frame_index, frame_as_numpy_array)
    """
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")

    frame_idx = 0
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_rate == 0:
                yield frame_idx, frame

            frame_idx += 1
    finally:
        cap.release()


def get_video_info(video_path: str) -> dict:
    """
    Get basic information about a video file.

    Returns:
        Dict with fps, width, height, total_frames, duration_seconds
    """
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")

    try:
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        return {
            "fps": fps,
            "width": width,
            "height": height,
            "total_frames": total_frames,
            "duration_seconds": round(duration, 2),
        }
    finally:
        cap.release()


async def download_video(url: str) -> str:
    """
    Download a video from URL to a temporary file.

    Args:
        url: Video URL to download

    Returns:
        Path to the downloaded temporary file
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(url)
        response.raise_for_status()

        # Write to temp file
        suffix = ".mp4"
        if "." in url.split("/")[-1]:
            suffix = "." + url.split(".")[-1]

        fd, temp_path = tempfile.mkstemp(suffix=suffix, prefix="smartflow_")
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(response.content)
        except Exception:
            os.close(fd)
            raise

        return temp_path
