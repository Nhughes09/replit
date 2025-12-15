import React from 'react';
import { motion } from 'framer-motion';

const FintechThermograph = ({ data }) => {
    // Generate mock "days" for the visualization if history is short
    const days = [
        { label: "Day -14", value: 30, status: "Quiet" },
        { label: "Day -10", value: 45, status: "Quiet" },
        { label: "Day -7", value: 85, status: "Hiring Spike" },
        { label: "Day -5", value: 70, status: "Accumulation" },
        { label: "Day -3", value: 92, status: "Insider Moves" },
        { label: "Today", value: data.smart_money_score || 98, status: "Strong Signal" },
    ];

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Smart Money Thermograph</h4>
                <div className="text-xs text-slate-500">Signal Strength (0-100)</div>
            </div>

            <div className="flex gap-2 h-32 items-end">
                {days.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="text-xs font-bold text-white mb-1">{day.label}</div>
                            <div className="text-xs text-slate-400">{day.status}</div>
                            <div className="text-xs text-blue-400 font-mono">Score: {day.value}</div>
                        </div>

                        {/* Bar */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${day.value}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`w-full rounded-t-sm ${day.value > 90 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' :
                                day.value > 70 ? 'bg-orange-500' :
                                    day.value > 40 ? 'bg-yellow-500' : 'bg-slate-700'
                                }`}
                        />

                        {/* Label */}
                        <div className="text-[10px] text-center text-slate-500 font-mono truncate">
                            {day.label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span> Quiet
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Accumulation
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]"></span> High Conviction
                </div>
                <div>
                    Alpha Window: <span className="text-white font-bold">31 Days Remaining</span>
                </div>
            </div>
        </div>
    );
};

export default FintechThermograph;
