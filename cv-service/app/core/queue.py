from typing import List
import numpy as np


class QueueEstimator:
    """
    Estimates traffic queue length based on stationary vehicle detection.

    A vehicle is considered stationary if its associated speed is below
    a threshold (default: 5 km/h). Queue length is estimated from the
    spatial distribution of stopped vehicles along the vertical axis.
    """

    def __init__(self, speed_threshold: float = 5.0, pixels_per_meter: float = 3.0):
        """
        Args:
            speed_threshold: Speed below which a vehicle is considered stopped (km/h)
            pixels_per_meter: Pixel-to-meter conversion (depends on camera)
        """
        self.speed_threshold = speed_threshold
        self.pixels_per_meter = pixels_per_meter
        self.queue_lengths: List[float] = []

    def estimate(
        self,
        detections: List[dict],
        average_speed: float,
        frame_height: int = 720,
    ) -> float:
        """
        Estimate queue length from detections and speed.

        If average speed is below threshold, estimate queue from
        the spatial spread of vehicles in the frame.

        Args:
            detections: Vehicle detections with bboxes
            average_speed: Current average speed from SpeedEstimator
            frame_height: Height of the video frame in pixels

        Returns:
            Estimated queue length in meters
        """
        if not detections or average_speed > self.speed_threshold:
            return 0.0

        # Get Y-coordinates of vehicle centers (bottom of bbox = road position)
        y_positions = []
        for det in detections:
            bbox = det["bbox"]
            # Bottom center of bounding box represents vehicle position
            y_bottom = bbox[3]  # y2
            y_positions.append(y_bottom)

        if len(y_positions) < 2:
            return 0.0

        # Queue length = spread of vehicle positions converted to meters
        y_positions = sorted(y_positions)
        pixel_span = y_positions[-1] - y_positions[0]
        queue_meters = pixel_span / self.pixels_per_meter

        # Apply a density-based scaling factor
        # More vehicles in the queue = more realistic length
        density_factor = min(2.0, len(detections) / 10.0)
        queue_meters *= density_factor

        self.queue_lengths.append(queue_meters)
        return round(queue_meters, 1)

    def get_average_queue(self) -> float:
        """Get average queue length across all frames."""
        if not self.queue_lengths:
            return 0.0
        # Use max of recent measurements (queue doesn't average well)
        recent = self.queue_lengths[-10:]
        return round(float(np.max(recent)), 1)

    def reset(self) -> None:
        """Reset for a new video."""
        self.queue_lengths.clear()
