import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const PredictionCard = ({ predictions, confidence, vertical }) => {
    // Helper to format values based on key
    const formatValue = (key, value) => {
        if (key.includes('amount') || key.includes('impact_usd')) return `$${(value / 1000000).toFixed(1)}M`;
        if (key.includes('days')) return `${value} days`;
        if (key.includes('pct') || key.includes('probability')) return `${value}%`;
        return value;
    };

    // Helper to get confidence color
    const getConfidenceColor = (score) => {
        if (score >= 0.9) return 'text-emerald-500';
        if (score >= 0.7) return 'text-blue-500';
        return 'text-amber-500';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Brain className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Live ML Predictions</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Inference Engine v2.1</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400">LIVE</span>
                </div>
            </div>

            <div className="space-y-4">
                {Object.entries(predictions).map(([key, value], idx) => {
                    const conf = confidence[key] || 0.85;
                    const confPct = (conf * 100).toFixed(1);

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm text-slate-400 font-medium capitalize">
                                    {key.replace(/_/g, ' ')}
                                </span>
                                <div className={`flex items-center gap-1 text-xs font-mono ${getConfidenceColor(conf)}`}>
                                    <CheckCircle className="w-3 h-3" />
                                    {confPct}% Conf.
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    {formatValue(key, value)}
                                </span>
                                <span className="text-xs text-slate-500">
                                    (±{(100 - conf * 100).toFixed(1)}% range)
                                </span>
                            </div>

                            {/* Confidence Bar */}
                            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confPct}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className={`h-full rounded-full ${conf >= 0.9 ? 'bg-emerald-500' : conf >= 0.7 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>MODEL: XGBoost-Pro-v4</span>
                    <span>LATENCY: 42ms</span>
                </div>
            </div>
        </div>
    );
};

export default PredictionCard;
