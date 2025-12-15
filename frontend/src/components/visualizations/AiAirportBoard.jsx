import React from 'react';

const AiAirportBoard = ({ data }) => {
    const flights = [
        { flight: "GPT-5", scheduled: "Q4 2025", actual: "Q2 2026", delay: "+180d", gate: "GATE 1", status: "DELAYED", color: "text-red-600" },
        { flight: "Claude 4", scheduled: "Q1 2026", actual: "Q1 2026", delay: "±0d", gate: "GATE 2", status: "ON TIME", color: "text-emerald-600" },
        { flight: "Mistral L", scheduled: "Q3 2025", actual: "Q3 2025", delay: "±0d", gate: "GATE 3", status: "BOARDING", color: "text-blue-600 animate-pulse" },
    ];

    return (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 font-mono relative overflow-hidden shadow-sm">

            <div className="flex justify-between items-center mb-6 border-b-2 border-slate-100 pb-2 relative z-20">
                <h3 className="text-slate-900 text-xl font-bold tracking-widest">INNOVATION DEPARTURES</h3>
                <div className="text-amber-500 text-sm animate-pulse font-bold">LIVE UPDATES</div>
            </div>

            <div className="space-y-4 relative z-20">
                <div className="grid grid-cols-5 text-slate-400 text-xs mb-2 font-bold">
                    <div>FLIGHT</div>
                    <div>SCHEDULED</div>
                    <div>ACTUAL</div>
                    <div>DELAY</div>
                    <div className="text-right">STATUS</div>
                </div>

                {flights.map((f, i) => (
                    <div key={i} className="grid grid-cols-5 text-sm border-b border-slate-100 pb-2 items-center group cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="text-slate-900 font-bold">{f.flight}</div>
                        <div className="text-slate-500">{f.scheduled}</div>
                        <div className="text-slate-500">{f.actual}</div>
                        <div className={`${f.delay.includes('+') ? 'text-red-600 font-bold' : 'text-slate-400'}`}>{f.delay}</div>
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
