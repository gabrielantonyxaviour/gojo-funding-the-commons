import numpy as np
from typing import List, Dict

def calculate_distribution(values: List[float]) -> Dict[str, float]:
    return {
        "min": float(min(values)),
        "max": float(max(values)),
        "mean": float(np.mean(values)),
        "median": float(np.median(values)),
        "p5": float(np.quantile(values, 0.05)),
        "p95": float(np.quantile(values, 0.95))
    }