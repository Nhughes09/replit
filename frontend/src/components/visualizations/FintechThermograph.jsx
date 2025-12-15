import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Info } from 'lucide-react';

const FintechThermograph = ({ data }) => {
    console.log("FintechThermograph Data:", data);
    const history = data.history || [];

    // If no history, show loading or empty
    if (!history || history.length === 0) return (
        <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            Initializing Smart Money Tracking...
        </div>
    );

    return (
        <div className="w-full h-[300px]">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Smart Money Flow</h4>
                    <div className="text-[10px] text-slate-400">Institutional Accumulation vs. Retail Volume</div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{data.smart_money_score || 0}/100</div>
                    <div className="text-[10px] text-slate-500">Current Signal Strength</div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                    />
                    <YAxis yAxisId="left" hide domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar
                        yAxisId="left"
                        dataKey="smart_money_score"
                        name="Smart Money Score"
                        fill="url(#colorScore)"
                        radius={[4, 4, 0, 0]}
                        barSize={8}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="download_velocity"
                        name="Download Velocity"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 bg-blue-50 p-2 rounded border border-blue-100">
                <Info size={12} className="text-blue-600" />
                <span>
                    <strong>Profit Insight:</strong> High blue bars (Smart Money) followed by rising orange line (Volume) indicates
                    institutional positioning before retail adoption.
                </span>
            </div>
        </div>
    );
};

export default FintechThermograph;
