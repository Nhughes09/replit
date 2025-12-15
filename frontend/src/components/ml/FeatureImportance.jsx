import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Microscope } from 'lucide-react';

const FeatureImportance = ({ explanation }) => {
    // Transform explanation dict to array for Recharts
    const data = Object.entries(explanation)
        .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 features

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Microscope className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Model Thinking Process</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Feature Importance (SHAP Values)</p>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ left: 10, right: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={150}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#64748b'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <p className="text-sm text-slate-300 italic">
                    "Primary driver is <span className="text-blue-400 font-bold">{data[0]?.name}</span> with {Math.round(data[0]?.value * 100)}% weight.
                    This suggests the model is prioritizing {data[0]?.name.includes('hiring') ? 'talent acquisition' : 'growth metrics'} over other signals."
                </p>
            </div>
        </div>
    );
};

export default FeatureImportance;
