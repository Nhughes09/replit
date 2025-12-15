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

    const [status, setStatus] = useState(null);
    const [debugLogs, setDebugLogs] = useState([]);

    const addDebugLog = (msg) => {
        setDebugLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
    };

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
                console.log("Preview Data:", previewData);
                console.log("Files Data:", filesData);
                console.log("Prediction Data:", predictionData);

                if (previewData.error || predictionData.error || predictionData.detail) {
                    console.error("API Error:", previewData.error || predictionData.error || predictionData.detail);
                    addDebugLog(`API Error: ${previewData.error || predictionData.error || predictionData.detail}`);
                    // Start polling status if error
                    pollStatus();
                }

                setData(previewData);
                setFiles(filesData.files || []);
                setPrediction(predictionData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                addDebugLog(`Fetch Error: ${err.message}`);
                setLoading(false);
                pollStatus();
            });
    }, [vertical]);

    const pollStatus = async () => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        try {
            addDebugLog(`Polling ${apiUrl}/api/status...`);
            // Add cache buster
            const res = await fetch(`${apiUrl}/api/status?t=${Date.now()}`);

            // Log Headers for debugging
            const dateHeader = res.headers.get('date');
            const serverHeader = res.headers.get('server');

            if (res.status === 404) {
                addDebugLog(`Status: 404 Not Found`);
                addDebugLog(`Server: ${serverHeader} | Time: ${dateHeader}`);

                // CHECK IF IT'S THE OLD BACKEND
                // If /api/status is 404, check /api/version
                try {
                    // Add cache buster to prevent Cloudflare from serving stale 404s
                    const verRes = await fetch(`${apiUrl}/api/version?t=${Date.now()}`);
                    if (verRes.ok) {
                        const verData = await verRes.json();
                        addDebugLog(`✓ NEW BACKEND DETECTED: ${verData.version}`);
                        addDebugLog("Status endpoint should be available momentarily...");
                    } else {
                        // If version check fails, check catalog (old endpoint)
                        const catRes = await fetch(`${apiUrl}/api/catalog?t=${Date.now()}`);
                        if (catRes.ok) {
                            addDebugLog("⚠️ DIAGNOSIS: OLD BACKEND DETECTED (v1.0)");
                            addDebugLog("The server is online but running old code.");
                            addDebugLog("Waiting for v2.1 update to apply...");
                        } else {
                            addDebugLog("Diagnosis: Server might be completely down.");
                        }
                    }
                } catch (err) {
                    addDebugLog("Diagnosis Check Failed.");
                }

                setStatus({ detail: "Not Found" });
            } else if (res.status === 503) {
                addDebugLog("Status: 503 Service Unavailable (Initializing)");
                const data = await res.json();
                setStatus(data);
            } else if (res.ok) {
                const data = await res.json();
                addDebugLog(`Status: 200 OK (Ready: ${data.ready})`);
                setStatus(data);

                if (!data.ready) {
                    setTimeout(pollStatus, 1000);
                    return;
                } else {
                    addDebugLog("System Ready. Reloading...");
                    window.location.reload();
                    return;
                }
            } else {
                addDebugLog(`Status: ${res.status} ${res.statusText}`);
            }

            setTimeout(pollStatus, 5000);
        } catch (e) {
            console.error("Status poll failed", e);
            addDebugLog(`Poll Connection Failed: ${e.message}`);
            setTimeout(pollStatus, 5000);
        }
    };

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center border-b border-slate-200 bg-slate-50">
            <div className="text-slate-400 animate-pulse font-medium flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Initializing ML Models for {vertical}...
            </div>
        </div>
    );

    // Config based on vertical
    const configs = {
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
    };

    const config = configs[vertical] || configs.fintech;

    const isError = !data || data.error || !prediction || prediction.error || prediction.detail || !prediction.predictions;

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

                {/* Content Area */}
                {isError ? (
                    <div className="h-[400px] flex items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200">
                        <div className="text-center max-w-md w-full p-6">
                            <p className="mb-4 font-bold text-slate-700 text-lg">System Initializing...</p>

                            {status && status.logs ? (
                                <div className="bg-slate-900 rounded-lg p-4 text-left font-mono text-xs text-emerald-400 shadow-inner h-48 overflow-y-auto flex flex-col-reverse">
                                    {status.logs.map((log, i) => (
                                        <div key={i} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0">
                                            <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-500 font-medium">
                                            {status && status.detail === "Not Found"
                                                ? "Backend is updating to v2.1... (This may take 2-3 mins)"
                                                : "Connecting to ML Engine Status Stream..."}
                                        </p>
                                        {status && status.detail === "Not Found" && (
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-500 h-full animate-progress-indeterminate"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Debug Console for Visibility */}
                                    <div className="bg-black rounded-md p-3 font-mono text-[10px] text-slate-400 h-32 overflow-y-auto border border-slate-800">
                                        <div className="text-slate-500 mb-1 border-b border-slate-800 pb-1">NETWORK DEBUG LOG:</div>
                                        {debugLogs.map((log, i) => (
                                            <div key={i} className={`${log.includes('404') ? 'text-amber-500' : 'text-slate-300'}`}>
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {status && status.progress !== undefined && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>{status.step}</span>
                                        <span>{status.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${status.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </section>
    );
};

export default ProductSection;
