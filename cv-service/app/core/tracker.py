from deep_sort_realtime.deepsort_tracker import DeepSort
from typing import List, Dict, Set
import numpy as np


class VehicleTracker:
    """
    Multi-object tracker using DeepSORT.

    Tracks vehicles across frames to:
    - Avoid double-counting the same vehicle
    - Maintain unique vehicle IDs
    - Count total unique vehicles that passed through the frame
    """

    def __init__(self, max_age: int = 30, n_init: int = 3):
        self.tracker = DeepSort(
            max_age=max_age,         # Frames before a lost track is deleted
            n_init=n_init,           # Frames before a track is confirmed
            max_iou_distance=0.7,
        )
        self.unique_ids: Set[int] = set()
        self.class_map: Dict[int, str] = {}  # track_id -> vehicle class

    def update(self, detections: List[dict], frame: np.ndarray) -> List[dict]:
        """
        Update tracker with new detections.

        Args:
            detections: List of detection dicts from VehicleDetector
            frame: Current video frame (needed for feature extraction)

        Returns:
            List of tracked detections with track_id added
        """
        if not detections:
            self.tracker.update_tracks([], frame=frame)
            return []

        # Format detections for DeepSORT: ([x1, y1, w, h], confidence, class_name)
        raw_detections = []
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            w = x2 - x1
            h = y2 - y1
            raw_detections.append(
                ([x1, y1, w, h], det["confidence"], det["class_name"])
            )

        # Update tracker
        tracks = self.tracker.update_tracks(raw_detections, frame=frame)

        # Build tracked detections
        tracked = []
        for track in tracks:
            if not track.is_confirmed():
                continue

            track_id = track.track_id
            ltrb = track.to_ltrb()  # [left, top, right, bottom]

            # Store unique ID
            self.unique_ids.add(track_id)

            # Store class mapping
            if track.det_class and track_id not in self.class_map:
                self.class_map[track_id] = track.det_class

            tracked.append({
                "track_id": track_id,
                "class_name": self.class_map.get(track_id, "unknown"),
                "bbox": [round(float(b), 1) for b in ltrb],
                "confidence": track.det_conf if track.det_conf else 0.0,
            })

        return tracked

    def get_unique_counts(self) -> dict:
        """
        Get total unique vehicle counts across all processed frames.
        """
        counts = {"cars": 0, "bikes": 0, "buses": 0, "trucks": 0}

        for track_id, class_name in self.class_map.items():
            if track_id in self.unique_ids:
                if class_name == "car":
                    counts["cars"] += 1
                elif class_name == "motorcycle":
                    counts["bikes"] += 1
                elif class_name == "bus":
                    counts["buses"] += 1
                elif class_name == "truck":
                    counts["trucks"] += 1

        counts["total"] = sum(counts.values())
        return counts

    def reset(self) -> None:
        """Reset tracker state for a new video."""
        self.tracker = DeepSort(max_age=30, n_init=3, max_iou_distance=0.7)
        self.unique_ids.clear()
        self.class_map.clear()
