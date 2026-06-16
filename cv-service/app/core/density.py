from typing import List


class DensityEstimator:
    """
    Estimates traffic density from vehicle detections.

    Density is classified based on the number of vehicles visible per frame:
      LOW:      < 15 vehicles
      MODERATE: 15-30 vehicles
      HIGH:     30-50 vehicles
      CRITICAL: > 50 vehicles
    """

    THRESHOLDS = {
        "LOW": 15,
        "MODERATE": 30,
        "HIGH": 50,
    }

    def estimate(self, detections: List[dict]) -> str:
        """
        Estimate density level from detections in a single frame.

        Args:
            detections: List of detection dicts

        Returns:
            Density level string: LOW, MODERATE, HIGH, or CRITICAL
        """
        count = len(detections)

        if count < self.THRESHOLDS["LOW"]:
            return "LOW"
        elif count < self.THRESHOLDS["MODERATE"]:
            return "MODERATE"
        elif count < self.THRESHOLDS["HIGH"]:
            return "HIGH"
        else:
            return "CRITICAL"

    def estimate_from_counts(self, total_vehicles: int, frames_counted: int) -> str:
        """
        Estimate average density across multiple frames.

        Args:
            total_vehicles: Sum of all vehicles across frames
            frames_counted: Number of frames counted

        Returns:
            Average density level
        """
        if frames_counted == 0:
            return "LOW"

        avg_per_frame = total_vehicles / frames_counted
        return self.estimate([{"stub": True}] * int(avg_per_frame))
