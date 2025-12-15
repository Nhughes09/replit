import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, DollarSign, Target } from 'lucide-react';

const ModelPerformance = () => {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const fetchPnL = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pnl`);
                const data = await res.json();
                setMetrics(data);
            } catch (e) {
                console.error("PnL fetch error", e);
            }
        };
        fetchPnL();
        const interval = setInterval(fetchPnL, 5000); // Live updates
        return () => clearInterval(interval);
    }, []);

    if (!metrics) return <div className="animate-pulse h-64 bg-slate-900 rounded-xl"></div>;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Model Track Record</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Live P&L Simulation</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <DollarSign className="w-3 h-3" /> Total P&L
                    </div>
                    <div className={`text-2xl font-bold ${metrics.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {metrics.total_pnl >= 0 ? '+' : ''}${metrics.total_pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Activity className="w-3 h-3" /> ROI
                    </div>
                    <div className={`text-2xl font-bold ${metrics.roi_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {metrics.roi_pct >= 0 ? '+' : ''}{metrics.roi_pct}%
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Win Rate</span>
                        <span className="text-white font-mono">{metrics.win_rate}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${metrics.win_rate}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-slate-500 text-xs">Avg Win</span>
                        <span className="text-emerald-400 font-mono">+{metrics.avg_win_pct}%</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 text-xs">Avg Loss</span>
                        <span className="text-rose-400 font-mono">{metrics.avg_loss_pct}%</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Active Positions: {metrics.active_positions}</span>
                        <span>Total Trades: {metrics.total_trades}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelPerformance;
