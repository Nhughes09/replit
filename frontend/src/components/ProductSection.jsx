import React, { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Globe, Lock, Download, ChevronDown, FileText } from 'lucide-react';
import PredictionCard from './ml/PredictionCard';
import ModelPerformance from './ml/ModelPerformance';
import FeatureImportance from './ml/FeatureImportance';

const ProductSection = ({ vertical, id }) => {
    const [data, setData] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFiles, setShowFiles] = useState(false);

    useEffect(() => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || '';

        // Fetch Data Preview, Files, AND ML Prediction
        Promise.all([
            fetch(`${apiUrl}/api/preview/${vertical}`).then(res => res.json()),
            fetch(`${apiUrl}/api/files/${vertical}`).then(res => res.json()),
            fetch(`${apiUrl}/api/predict/${vertical}`).then(res => res.json())
        ])
            .then(([previewData, filesData, predictionData]) => {
                setData(previewData);
                setFiles(filesData.files || []);
                setPrediction(predictionData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [vertical]);

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center border-b border-slate-200 bg-slate-50">
            <div className="text-slate-400 animate-pulse font-medium flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Initializing ML Models for {vertical}...
            </div>
        </div>
    );

    if (!data || !prediction) return null;

    // Config based on vertical
    const config = {
        fintech: {
            title: "Fintech Growth Intelligence",
            icon: <Activity className="text-blue-600" size={32} />,
            color: "blue",
            desc: "Predicting funding rounds and valuation shifts before they happen."
        },
        ai_talent: {
            title: "AI Talent & Capital Prediction",
            icon: <Zap className="text-indigo-600" size={32} />,
            color: "indigo",
            desc: "Tracking engineer migration to predict model breakthroughs."
        },
        esg: {
            title: "ESG Impact & Greenwashing Detector",
            icon: <Shield className="text-emerald-600" size={32} />,
            color: "emerald",
            desc: "Quantifying the gap between corporate claims and reality."
        },
        regulatory: {
            title: "Regulatory Compliance Prediction",
            icon: <Lock className="text-red-600" size={32} />,
            color: "red",
            desc: "Forecasting enforcement actions and fine probabilities."
        },
        supply_chain: {
            title: "Supply Chain Resilience Intelligence",
            icon: <Globe className="text-amber-600" size={32} />,
            color: "amber",
            desc: "Predicting disruption risks and recovery timelines."
        }
    }[vertical] || config.fintech;

    return (
        <section id={id} className="py-20 border-b border-slate-200 last:border-0 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 bg-white rounded-2xl border border-slate-200 shadow-sm`}>
                            {config.icon}
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{config.title}</h2>
                            <p className="text-slate-500 text-lg">{config.desc}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFiles(!showFiles)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                        >
                            <Download size={18} />
                            Download Data
                            <ChevronDown size={16} className={`transition-transform ${showFiles ? 'rotate-180' : ''}`} />
                        </button>

                        {showFiles && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                                <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Available Datasets
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {files.map((file, i) => (
                                        <a
                                            key={i}
                                            href={`${import.meta.env.VITE_API_URL || ''}/api/download/${file.filename}`}
                                            className="block p-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-slate-900">{file.name}</span>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{file.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <FileText size={12} />
                                                <span className="truncate max-w-[150px]">{file.filename}</span>
                                                <span className="text-slate-300">•</span>
                                                {file.size}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ML Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Active Predictions (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        <PredictionCard
                            predictions={prediction.predictions}
                            confidence={prediction.confidence}
                            vertical={vertical}
                        />

                        <FeatureImportance explanation={prediction.explanation} />
                    </div>

                    {/* RIGHT COLUMN: Model Performance (4 cols) */}
                    <div className="lg:col-span-4">
                        <ModelPerformance />

                        {/* Additional Info Card */}
                        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                                Data Sources
                            </h4>
                            <ul className="space-y-3">
                                {Object.keys(prediction.explanation).slice(0, 4).map((key, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                    </li>
                                ))}
                                <li className="text-xs text-slate-400 italic pt-2">
                                    + 28 other signals processed
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductSection;
