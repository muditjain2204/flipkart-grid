import numpy as np
from ultralytics import YOLO
from typing import List, Tuple, Optional
from app.config import settings


# COCO class IDs for vehicles
VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}


class VehicleDetector:
    """
    YOLOv8-based vehicle detector.

    Loads the YOLO model once at initialization and reuses it for all detections.
    Only detects vehicle classes (car, motorcycle, bus, truck) from COCO.
    """

    def __init__(self, model_path: str = None, confidence: float = None):
        self.model_path = model_path or settings.YOLO_MODEL_PATH
        self.confidence = confidence or settings.YOLO_CONFIDENCE_THRESHOLD
        self.model: Optional[YOLO] = None

    def load_model(self) -> None:
        """Load YOLO model into memory. Call once at startup."""
        print(f"🔍 Loading YOLO model from {self.model_path}...")
        self.model = YOLO(self.model_path)
        print(f"✅ YOLO model loaded successfully")

    def detect_frame(self, frame: np.ndarray) -> List[dict]:
        """
        Run vehicle detection on a single frame.

        Args:
            frame: BGR image as numpy array (from OpenCV)

        Returns:
            List of detection dicts with keys:
            class_name, confidence, bbox [x1, y1, x2, y2], class_id
        """
        if self.model is None:
            self.load_model()

        results = self.model(
            frame,
            conf=self.confidence,
            classes=list(VEHICLE_CLASSES.keys()),  # Only detect vehicles
            verbose=False,
        )

        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            for i in range(len(boxes)):
                class_id = int(boxes.cls[i].item())
                if class_id not in VEHICLE_CLASSES:
                    continue

                conf = float(boxes.conf[i].item())
                bbox = boxes.xyxy[i].tolist()  # [x1, y1, x2, y2]

                detections.append({
                    "class_name": VEHICLE_CLASSES[class_id],
                    "class_id": class_id,
                    "confidence": round(conf, 3),
                    "bbox": [round(b, 1) for b in bbox],
                })

        return detections

    def count_vehicles(self, detections: List[dict]) -> dict:
        """
        Count vehicles by category from detection results.

        Returns:
            Dict with keys: cars, bikes, buses, trucks, total
        """
        counts = {"cars": 0, "bikes": 0, "buses": 0, "trucks": 0}

        for det in detections:
            name = det["class_name"]
            if name == "car":
                counts["cars"] += 1
            elif name == "motorcycle":
                counts["bikes"] += 1
            elif name == "bus":
                counts["buses"] += 1
            elif name == "truck":
                counts["trucks"] += 1

        counts["total"] = sum(counts.values())
        return counts

    @property
    def is_loaded(self) -> bool:
        return self.model is not None

    @property
    def model_name(self) -> str:
        return self.model_path.split("/")[-1] if self.model_path else "unknown"
