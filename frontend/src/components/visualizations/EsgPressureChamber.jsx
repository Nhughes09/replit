import React from 'react';
import { motion } from 'framer-motion';

const EsgPressureChamber = ({ data }) => {
    const claims = 100;
    const reality = 23;
    const gap = claims - reality;

    return (
        <div className="w-full bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-sm">Greenwashing Pressure Chamber</h4>
                <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/30">
                    CRITICAL GAP: {gap}%
                </div>
            </div>

            <div className="relative h-16 bg-slate-800 rounded-full overflow-hidden mb-4">
                {/* Claims Bar (Background) */}
                <div className="absolute inset-0 bg-slate-700/30 flex items-center px-4 text-xs text-slate-500 font-bold">
                    MARKETING CLAIMS (100 PSI)
                </div>

                {/* Reality Bar (Foreground) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reality}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center justify-end px-4"
                >
                    <span className="text-white font-bold text-xs whitespace-nowrap">REALITY ({reality} PSI)</span>
                </motion.div>

                {/* Gap Pattern */}
                <div
                    className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(45deg,rgba(239,68,68,0.1),rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.2)_10px,rgba(239,68,68,0.2)_20px)] border-l-2 border-red-500/50"
                    style={{ left: `${reality}%` }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold text-xs whitespace-nowrap bg-slate-900/80 px-2 py-1 rounded">
                        UNVERIFIED GAP
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                    <div className="text-emerald-500 font-bold mb-1">VERIFIED (77 PSI)</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                        <li>Renewable Factories</li>
                        <li>Battery Recycling</li>
                    </ul>
                </div>
                <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
                    <div className="text-red-500 font-bold mb-1">UNVERIFIED (23 PSI)</div>
                    <ul className="list-disc list-inside text-slate-400 space-y-1">
                        <li>Cobalt Supply Chain</li>
                        <li>Carbon Offsets</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EsgPressureChamber;
