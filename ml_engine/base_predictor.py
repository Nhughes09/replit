import os
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from datetime import datetime
import joblib
from .pnl_tracker import PnLTracker

class BasePredictor:
    """
    Base class for all vertical-specific ML predictors.
    Handles model loading, prediction orchestration, and confidence calibration.
    """
    
    def __init__(self, vertical_name: str, pnl_tracker: PnLTracker):
        self.vertical = vertical_name
        self.pnl_tracker = pnl_tracker
        self.models = {}
        self.model_metadata = {}
        self.feature_importance = {}
        
        # Load models if they exist
        self._load_models()
        
    def _load_models(self):
        """
        Load trained models from disk.
        Expected structure: ml_engine/models/{vertical}/{target}.pkl
        """
        model_dir = f"ml_engine/models/{self.vertical}"
        if not os.path.exists(model_dir):
            print(f"No models found for {self.vertical}, initializing empty.")
            return

        # This is a placeholder for actual model loading logic
        # In a real scenario, we would iterate through .pkl files
        pass

    def predict(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point. Returns predictions, confidence, and explanation.
        """
        # 1. Preprocess Data
        features = self._preprocess(company_data)
        
        # 2. Generate Predictions
        predictions = self._run_inference(features)
        
        # 3. Calculate Confidence
        confidence = self._calculate_confidence(features, predictions)
        
        # 4. Explain Prediction (Feature Importance)
        explanation = self._explain_prediction(features)
        
        # 5. Log to P&L Tracker (Simulated)
        self._log_pnl_impact(predictions, confidence)
        
        return {
            'company': company_data.get('name', 'Unknown'),
            'predictions': predictions,
            'confidence': confidence,
            'explanation': explanation,
            'timestamp': datetime.now().isoformat()
        }

    def _preprocess(self, data: Dict) -> pd.DataFrame:
        """
        Convert raw dictionary data into model-ready feature vector.
        Must be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement _preprocess")

    def _run_inference(self, features: pd.DataFrame) -> Dict[str, Any]:
        """
        Run the actual ML models.
        Must be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement _run_inference")

    def _calculate_confidence(self, features: pd.DataFrame, predictions: Dict) -> Dict[str, float]:
        """
        Calculate confidence score (0.0 - 1.0) for the prediction.
        Default implementation uses a heuristic based on data completeness.
        """
        # Placeholder: Confidence based on how many features are non-null
        completeness = features.notnull().mean().mean()
        base_confidence = 0.7 + (completeness * 0.2) # 0.7 to 0.9 range
        
        # Add some random variance for "realism" in the demo if no real model
        return {k: min(0.98, max(0.4, base_confidence)) for k in predictions.keys()}

    def _explain_prediction(self, features: pd.DataFrame) -> Dict[str, float]:
        """
        Return feature importance weights for the prediction.
        """
        # Placeholder: Return random weights for demo purposes if no SHAP
        # Subclasses should override this with real SHAP values
        return {col: np.random.uniform(0.1, 0.9) for col in features.columns[:5]}

    def _log_pnl_impact(self, predictions: Dict, confidence: Dict):
        """
        Log this prediction to the P&L tracker to simulate a trade.
        """
        # We pick the primary prediction target to track
        primary_target = list(predictions.keys())[0]
        pred_value = predictions[primary_target]
        conf_score = confidence.get(primary_target, 0.5)
        
        # Log it
        self.pnl_tracker.record_prediction(
            prediction_id=f"{self.vertical}_{datetime.now().timestamp()}",
            vertical=self.vertical,
            target=primary_target,
            predicted_value=pred_value,
            confidence=conf_score,
            expected_timeline_days=30 # Default
        )
