import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class PnLTracker:
    """
    Tracks hypothetical P&L for all predictions to demonstrate value.
    Simulates a portfolio that invests based on model confidence.
    """
    
    def __init__(self, initial_capital: float = 1_000_000.0):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.predictions = []  # Log of all predictions made
        self.positions = []    # Active "investments"
        self.closed_trades = [] # Completed trades
        self.win_count = 0
        self.loss_count = 0
        
        # Performance metrics
        self.total_pnl = 0.0
        self.roi_pct = 0.0
        
    def calculate_position_size(self, confidence: float) -> float:
        """
        Kelly Criterion-inspired position sizing based on confidence.
        Higher confidence = larger bet size.
        """
        if confidence < 0.5:
            return 0.0
            
        # Simple scaling: 50% conf = 0% size, 100% conf = 10% of capital
        # This is a conservative simulation
        max_position_pct = 0.10
        scale_factor = (confidence - 0.5) * 2  # 0.0 to 1.0
        
        return self.current_capital * max_position_pct * scale_factor

    def record_prediction(self, prediction_id: str, vertical: str, target: str, 
                         predicted_value: any, confidence: float, 
                         expected_timeline_days: int):
        """
        Log a new prediction and "open" a hypothetical position.
        """
        position_size = self.calculate_position_size(confidence)
        
        record = {
            'id': prediction_id,
            'date': datetime.now().isoformat(),
            'vertical': vertical,
            'target': target,
            'prediction': predicted_value,
            'confidence': confidence,
            'position_size': position_size,
            'status': 'OPEN',
            'expected_close_date': (datetime.now() + timedelta(days=expected_timeline_days)).isoformat()
        }
        
        self.predictions.append(record)
        if position_size > 0:
            self.positions.append(record)
            
        return position_size

    def resolve_prediction(self, prediction_id: str, actual_value: any, success: bool, pnl_pct: float):
        """
        Close a position based on real-world outcome.
        pnl_pct: The simulated return on the position (e.g., 0.20 for 20% gain)
        """
        # Find the position
        position = next((p for p in self.positions if p['id'] == prediction_id), None)
        
        if not position:
            return
            
        # Calculate P&L
        invested_amount = position['position_size']
        pnl_amount = invested_amount * pnl_pct
        
        self.current_capital += pnl_amount
        self.total_pnl += pnl_amount
        self.roi_pct = (self.current_capital - self.initial_capital) / self.initial_capital * 100
        
        if success:
            self.win_count += 1
        else:
            self.loss_count += 1
            
        # Move to closed
        position['status'] = 'CLOSED'
        position['actual_value'] = actual_value
        position['pnl_amount'] = pnl_amount
        position['pnl_pct'] = pnl_pct
        position['close_date'] = datetime.now().isoformat()
        
        self.closed_trades.append(position)
        self.positions.remove(position)

    def get_performance_metrics(self) -> Dict:
        """
        Return comprehensive performance stats for the dashboard.
        """
        total_trades = self.win_count + self.loss_count
        win_rate = (self.win_count / total_trades * 100) if total_trades > 0 else 0.0
        
        return {
            'current_capital': self.current_capital,
            'total_pnl': self.total_pnl,
            'roi_pct': round(self.roi_pct, 2),
            'win_rate': round(win_rate, 1),
            'total_trades': total_trades,
            'active_positions': len(self.positions),
            'avg_win_pct': self._calculate_avg_pnl(wins_only=True),
            'avg_loss_pct': self._calculate_avg_pnl(losses_only=True)
        }
        
    def _calculate_avg_pnl(self, wins_only=False, losses_only=False) -> float:
        trades = self.closed_trades
        if wins_only:
            trades = [t for t in trades if t['pnl_amount'] > 0]
        if losses_only:
            trades = [t for t in trades if t['pnl_amount'] <= 0]
            
        if not trades:
            return 0.0
            
        avg = sum(t['pnl_pct'] for t in trades) / len(trades) * 100
        return round(avg, 1)
