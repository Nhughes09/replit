import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

const AlphaCalculator = ({ probability, roi, risk, type }) => {
    const [investment, setInvestment] = useState(100000);

    // Parse inputs (handle strings like "87%" or "$4.2M")
    const probVal = parseInt(probability) / 100 || 0.85;
    const roiVal = 0.32; // Default 32% for demo if not passed
    const riskVal = 0.08; // Default 8% downside

    const expectedValue = (investment * (1 + roiVal) * probVal) + (investment * (1 - riskVal) * (1 - probVal));
    const profit = expectedValue - investment;

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                <Calculator className="text-emerald-400" size={24} />
                <h3 className="text-xl font-bold text-white">Alpha Calculator</h3>
            </div>

            <div className="mb-8">
                <label className="block text-slate-400 text-sm mb-2 font-bold uppercase tracking-wider">Investment Amount</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="10000"
                        max="5000000"
                        step="10000"
                        value={investment}
                        onChange={(e) => setInvestment(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg text-white font-mono font-bold min-w-[140px] text-right">
                        ${investment.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={16} className="text-emerald-400" />
                        <span className="text-emerald-400 font-bold text-sm">Upside Scenario ({parseInt(probVal * 100)}%)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        +${(investment * roiVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Based on historical {type} signals</div>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={16} className="text-red-400" />
                        <span className="text-red-400 font-bold text-sm">Downside Risk ({parseInt((1 - probVal) * 100)}%)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        -${(investment * riskVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Stop-loss recommended at -8%</div>
                </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <span className="text-slate-400 font-medium">Expected Value (45 Days):</span>
                <span className="text-3xl font-bold text-emerald-400">+${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <DollarSign size={18} />
                Export Calculation to CSV
            </button>
        </div>
    );
};

export default AlphaCalculator;
