import cv2
import numpy as np
from typing import List, Optional, Tuple


class SpeedEstimator:
    """
    Estimates average traffic speed using optical flow between consecutive frames.

    Uses Farneback dense optical flow to calculate pixel displacement,
    then converts to approximate km/h using a calibration factor.

    The calibration factor maps pixel displacement to real-world speed.
    Default is tuned for typical Indian traffic CCTV camera angles.
    """

    def __init__(self, calibration_factor: float = 0.15, fps: float = 30.0):
        """
        Args:
            calibration_factor: Pixels-to-km/h conversion factor.
                                Depends on camera angle, height, and zoom.
            fps: Video frame rate for time-based calculations.
        """
        self.calibration_factor = calibration_factor
        self.fps = fps
        self.prev_gray: Optional[np.ndarray] = None
        self.speeds: List[float] = []

    def estimate(self, frame: np.ndarray, detections: List[dict]) -> float:
        """
        Estimate average speed from optical flow in vehicle regions.

        Args:
            frame: Current BGR frame
            detections: List of vehicle detections with bboxes

        Returns:
            Estimated average speed in km/h
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if self.prev_gray is None:
            self.prev_gray = gray
            return 0.0

        # Calculate dense optical flow
        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray, gray,
            None,
            pyr_scale=0.5,
            levels=3,
            winsize=15,
            iterations=3,
            poly_n=5,
            poly_sigma=1.2,
            flags=0,
        )

        # Calculate speed only within vehicle bounding boxes
        frame_speeds = []
        for det in detections:
            bbox = det["bbox"]
            x1, y1, x2, y2 = [int(b) for b in bbox]

            # Clip to frame bounds
            h, w = gray.shape
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)

            if x2 <= x1 or y2 <= y1:
                continue

            # Get flow magnitude in vehicle region
            region_flow = flow[y1:y2, x1:x2]
            magnitude = np.sqrt(
                region_flow[..., 0] ** 2 + region_flow[..., 1] ** 2
            )
            avg_magnitude = float(np.mean(magnitude))

            # Convert pixel displacement to km/h
            speed_kmh = avg_magnitude * self.calibration_factor * self.fps
            frame_speeds.append(speed_kmh)

        self.prev_gray = gray

        if frame_speeds:
            avg_speed = np.mean(frame_speeds)
            self.speeds.append(float(avg_speed))
            return float(avg_speed)

        return 0.0

    def get_average_speed(self) -> float:
        """Get average speed across all processed frames."""
        if not self.speeds:
            return 0.0
        return round(float(np.mean(self.speeds)), 1)

    def reset(self) -> None:
        """Reset for a new video."""
        self.prev_gray = None
        self.speeds.clear()
