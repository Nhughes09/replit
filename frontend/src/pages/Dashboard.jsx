import React from 'react';
import { ArrowDown } from 'lucide-react';
import ProductSection from '../components/ProductSection';

const Dashboard = () => {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="min-h-[80vh] flex flex-col justify-center items-start pt-20 pb-20 border-b border-slate-200">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-mono text-sm mb-6 font-bold">
                    v2.0 LIVE • PREMIUM DATA ENGINE ACTIVE
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-8 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">HHeuristics</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl leading-relaxed mb-12">
                    We don't just sell data. We transform raw signals into
                    <span className="text-slate-900 font-bold"> actionable alpha</span>.
                    Scroll down to explore our 5 proprietary intelligence pipelines,
                    visualized in real-time.
                </p>

                <div className="flex gap-4">
                    <a href="#fintech" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        Explore Pipelines <ArrowDown size={20} />
                    </a>
                    <div className="px-8 py-4 rounded-full border border-slate-200 text-slate-500 font-mono bg-white">
                        5 Active Verticals
                    </div>
                </div>
            </div>

            {/* Product Sections */}
            <ProductSection vertical="fintech" id="fintech" />
            <ProductSection vertical="ai_talent" id="ai_talent" />
            <ProductSection vertical="esg" id="esg" />
            <ProductSection vertical="regulatory" id="regulatory" />
            <ProductSection vertical="supply_chain" id="supply_chain" />

            {/* Footer */}
            <div className="py-20 text-center text-slate-400 text-sm border-t border-slate-200 mt-20">
                <p>© 2025 HHeuristics Data Products. All rights reserved.</p>
                <p className="mt-2">Institutional Grade Data Intelligence.</p>
            </div>
        </div>
    );
};

export default Dashboard;
