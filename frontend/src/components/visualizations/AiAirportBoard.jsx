import React from 'react';

const AiAirportBoard = ({ data }) => {
    const flights = [
        { flight: "GPT-5", scheduled: "Q4 2025", actual: "Q2 2026", delay: "+180d", gate: "GATE 1", status: "DELAYED", color: "text-red-500" },
        { flight: "Claude 4", scheduled: "Q1 2026", actual: "Q1 2026", delay: "±0d", gate: "GATE 2", status: "ON TIME", color: "text-emerald-500" },
        { flight: "Mistral L", scheduled: "Q3 2025", actual: "Q3 2025", delay: "±0d", gate: "GATE 3", status: "BOARDING", color: "text-blue-500 animate-pulse" },
    ];

    return (
        <div className="bg-black border-4 border-slate-800 rounded-xl p-6 font-mono relative overflow-hidden">
            {/* Scanlines effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>

            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-800 pb-2 relative z-20">
                <h3 className="text-yellow-500 text-xl font-bold tracking-widest">INNOVATION DEPARTURES</h3>
                <div className="text-yellow-500 text-sm animate-pulse">LIVE UPDATES</div>
            </div>

            <div className="space-y-4 relative z-20">
                <div className="grid grid-cols-5 text-slate-500 text-xs mb-2">
                    <div>FLIGHT</div>
                    <div>SCHEDULED</div>
                    <div>ACTUAL</div>
                    <div>DELAY</div>
                    <div className="text-right">STATUS</div>
                </div>

                {flights.map((f, i) => (
                    <div key={i} className="grid grid-cols-5 text-sm border-b border-slate-900 pb-2 items-center group cursor-pointer hover:bg-slate-900/50 transition-colors">
                        <div className="text-white font-bold">{f.flight}</div>
                        <div className="text-slate-400">{f.scheduled}</div>
                        <div className="text-slate-400">{f.actual}</div>
                        <div className={`${f.delay.includes('+') ? 'text-red-500' : 'text-slate-400'}`}>{f.delay}</div>
                        <div className={`text-right font-bold ${f.color}`}>{f.status}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-xs text-slate-500 relative z-20">
                * DELAY DETECTED: GPT-5 (Benchmark Inflation &gt; 40%)
            </div>
        </div>
    );
};

export default AiAirportBoard;
