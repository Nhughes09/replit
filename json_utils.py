import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)

def convert_numpy_types(obj):
    """
    Recursively convert NumPy types to standard Python types for JSON serialization.
    """
    if isinstance(obj, (np.int_, np.intc, np.intp, np.int8,
                        np.int16, np.int32, np.int64, np.uint8,
                        np.uint16, np.uint32, np.uint64)):
        return int(obj)
    elif isinstance(obj, (np.float_, np.float16, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(i) for i in obj]
    elif isinstance(obj, (pd.Timestamp, pd.DatetimeIndex)):
        return str(obj)
    return obj

def log_object_types(obj, prefix="", depth=0, max_depth=3):
    """
    Log the types of keys and values in a dictionary or list to help debug serialization issues.
    """
    if depth > max_depth:
        return

    indent = "  " * depth
    if isinstance(obj, dict):
        for k, v in obj.items():
            logger.error(f"{indent}{prefix}Key: {k} ({type(k)}), Value Type: {type(v)}")
            if isinstance(v, (dict, list)):
                log_object_types(v, prefix=f"{k}.", depth=depth+1, max_depth=max_depth)
    elif isinstance(obj, list):
        for i, v in enumerate(obj[:5]): # Only check first 5 to avoid spam
            logger.error(f"{indent}{prefix}Index: {i}, Value Type: {type(v)}")
            if isinstance(v, (dict, list)):
                log_object_types(v, prefix=f"[{i}].", depth=depth+1, max_depth=max_depth)
