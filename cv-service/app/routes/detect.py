import io
import numpy as np
import cv2
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import FrameDetectionResponse, DensityLevel

router = APIRouter()


@router.post("/detect", response_model=FrameDetectionResponse)
async def detect_vehicles(image: UploadFile = File(...)):
    """
    Detect vehicles in a single image/frame.

    Accepts: image file (JPEG, PNG)
    Returns: Vehicle counts, density level, and detection details.
    """
    from main import detector

    # Read uploaded image
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Run detection
    detections = detector.detect_frame(frame)
    counts = detector.count_vehicles(detections)

    # Determine density
    from app.core.density import DensityEstimator
    density_estimator = DensityEstimator()
    density_level = density_estimator.estimate(detections)

    return FrameDetectionResponse(
        cars=counts["cars"],
        bikes=counts["bikes"],
        buses=counts["buses"],
        trucks=counts["trucks"],
        total_vehicles=counts["total"],
        density_level=DensityLevel(density_level),
        detections=[
            {
                "class_name": d["class_name"],
                "confidence": d["confidence"],
                "bbox": d["bbox"],
                "track_id": None,
            }
            for d in detections
        ],
    )
