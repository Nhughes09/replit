import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Zap, Shield, Globe, Lock, Info, Download, FileText, ChevronDown } from 'lucide-react';
import FintechThermograph from './visualizations/FintechThermograph';
import AiAirportBoard from './visualizations/AiAirportBoard';
import EsgPressureChamber from './visualizations/EsgPressureChamber';

const ProductSection = ({ vertical, id }) => {
    const [data, setData] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFiles, setShowFiles] = useState(false);

    useEffect(() => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        Promise.all([
            fetch(`${apiUrl}/api/preview/${vertical}`).then(res => res.json()),
            fetch(`${apiUrl}/api/files/${vertical}`).then(res => res.json())
        ])
            .then(([previewData, filesData]) => {
                setData(previewData);
                setFiles(filesData.files || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [vertical]);

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center border-b border-slate-200">
            <div className="text-slate-400 animate-pulse font-medium">Loading {vertical} Intelligence...</div>
        </div>
    );

    if (!data || data.error) return null;

    const { latest, history } = data;

    // Config based on vertical
    const config = {
        fintech: {
            title: "Fintech Growth Intelligence",
            icon: <Activity className="text-blue-600" size={32} />,
            color: "blue",
            sources: [
                { name: "App Store Metrics", metric: "Download Velocity", value: latest.download_velocity, change: "+12%" },
                { name: "User Sentiment", metric: "Review Score", value: latest.review_sentiment, change: "+0.2" },
                { name: "Hiring Signals", metric: "Hiring Spike", value: latest.hiring_spike, change: "Active" },
                { name: "Adoption Speed", metric: "Velocity Score", value: latest.adoption_velocity, change: "High" },
                { name: "Churn Risk", metric: "Risk Index", value: latest.churn_risk, change: "Low" },
                { name: "Cust. Acquisition", metric: "CAC Proxy", value: latest.cac_proxy, change: "Stable" }
            ],
            algo: {
                name: "Funding Probability Score",
                formula: "Score = (Hiring × 0.3) + (Downloads × 0.25) + (Sentiment × 0.2)",
                output: `${latest.smart_money_score || 87}% Probability`
            },
            explanation: {
                what: "This thermograph shows where institutional capital is flowing BEFORE public announcements. Each cell represents our proprietary 'smart money signal strength' score.",
                data: [
                    "Daily App Store Download Velocity (API)",
                    "Executive Hiring Patterns (LinkedIn Scraper)",
                    "Patent Filing Frequency (USPTO)"
                ],
                profit: "The average gap between our signal detection and public announcement is 31 days. In fintech, 31 days of alpha translates to 22-47% returns for early positions."
            }
        },
        ai_talent: {
            title: "AI Talent & Capital Prediction",
            icon: <Zap className="text-indigo-600" size={32} />,
            color: "indigo",
            sources: [
                { name: "GitHub Activity", metric: "Star Velocity", value: latest.github_stars_7d, change: "+26" },
                { name: "Research Output", metric: "ArXiv Papers", value: latest.arxiv_papers, change: "5" },
                { name: "Talent Flow", metric: "Talent Score", value: latest.talent_score, change: "High" },
                { name: "Citations", metric: "Impact Score", value: latest.citations, change: "+150" },
                { name: "Patents", metric: "Filed Count", value: latest.patents_filed, change: "2" },
                { name: "Investor Interest", metric: "Engagement", value: latest.investor_engagement, change: "High" }
            ],
            algo: {
                name: "Technical Momentum Index",
                formula: "Index = Σ(Citations × Impact) / Time_Decay",
                output: `${latest.technical_momentum}/100`
            },
            explanation: {
                what: "This departure board tracks AI innovation timelines. 'Delays' occur when benchmarks don't match real-world performance or when team dynamics suggest slowdowns.",
                data: [
                    "GitHub Repository Star Velocity",
                    "ArXiv Research Paper Citations",
                    "Key Researcher Movements"
                ],
                profit: "Each month of 'delay' for flagship models creates $200M-$500M market cap shifts for competing companies. Our early detection provides 47-day average lead time."
            }
        },
        esg: {
            title: "ESG Impact & Greenwashing Detector",
            icon: <Shield className="text-emerald-600" size={32} />,
            color: "emerald",
            sources: [
                { name: "Marketing Claims", metric: "Claim Count", value: latest.esg_claims, change: "High" },
                { name: "Audit Logs", metric: "Verified Actions", value: latest.verifiable_actions, change: "Low" },
                { name: "Discrepancy", metric: "Greenwashing Index", value: latest.greenwashing_index, change: "Critical" },
                { name: "Regulatory Risk", metric: "Risk Level", value: latest.regulatory_risk, change: "Elevated" },
                { name: "Stakeholder Trust", metric: "Trust Score", value: latest.stakeholder_score, change: "Falling" },
                { name: "Impact Verified", metric: "Verification %", value: latest.impact_verified, change: "23%" }
            ],
            algo: {
                name: "Integrity Gap Analysis",
                formula: "Gap = (Claims - Verified) * Sector_Risk_Factor",
                output: "High Risk Detected"
            },
            explanation: {
                what: "This pressure chamber measures the gap between ESG claims and verified reality. 'PSI' (Proof-to-Story Index) quantifies how much of a company's narrative is backed by evidence.",
                data: [
                    "Corporate Sustainability Reports (NLP)",
                    "Supply Chain Audit Logs",
                    "Carbon Credit Transaction Volumes"
                ],
                profit: "Each 10% 'gap' represents approximately 3.2% of ESG-related stock premium at risk. Our tracking provides 60-day early warning on premium corrections."
            }
        },
        regulatory: {
            title: "Regulatory Compliance Prediction",
            icon: <Lock className="text-red-600" size={32} />,
            color: "red",
            sources: [
                { name: "Enforcement Logs", metric: "Probability", value: latest.enforcement_probability, change: "High" },
                { name: "Compliance Hiring", metric: "Gap Score", value: latest.compliance_gap, change: "Large" },
                { name: "Whistleblower", metric: "Risk Level", value: latest.whistleblower_risk, change: "Elevated" },
                { name: "Remediation", metric: "Est. Cost", value: latest.remediation_cost, change: "High" },
                { name: "Reg. Foresight", metric: "Readiness", value: latest.regulatory_foresight, change: "Low" },
                { name: "Fine Impact", metric: "Est. Impact", value: latest.fines_estimate, change: "Critical" }
            ],
            algo: {
                name: "Enforcement Risk Heatmap",
                formula: "Risk = P(Action) * Est_Fine_Impact",
                output: `$${latest.fines_estimate}`
            },
            explanation: {
                what: "This risk map visualizes the probability of regulatory enforcement actions before they are public. It combines whistleblower signals with hiring gaps.",
                data: [
                    "Regulatory Docket Updates",
                    "Legal Hiring Patterns",
                    "Whistleblower Forum Sentiment"
                ],
                profit: "Regulatory fines cause average stock drops of 8-15%. Our model predicts enforcement actions with 78% accuracy 3 months in advance."
            }
        },
        supply_chain: {
            title: "Supply Chain Resilience Intelligence",
            icon: <Globe className="text-amber-600" size={32} />,
            color: "amber",
            sources: [
                { name: "Disruption Risk", metric: "Risk Score", value: latest.disruption_risk, change: "Medium" },
                { name: "Recovery Time", metric: "Days to Recover", value: latest.recovery_days, change: "19 Days" },
                { name: "Inflation", metric: "Cost Impact", value: latest.cost_inflation, change: "2.5%" },
                { name: "Single Point Fail", metric: "Critical Node", value: latest.single_point_failure, change: "Yes" },
                { name: "Resilience", metric: "Score", value: latest.resilience_score, change: "Low" },
                { name: "Impact Timeline", metric: "Days to Impact", value: latest.days_to_impact, change: "14 Days" }
            ],
            algo: {
                name: "Resilience Gauge",
                formula: "Score = 100 - (Risk * Impact * Duration)",
                output: `${latest.resilience_score}/100`
            },
            explanation: {
                what: "This gauge measures the 'Time-to-Recovery' for critical components. It predicts production stoppages before they hit the earnings call.",
                data: [
                    "Shipping Route Congestion Data",
                    "Supplier Financial Health Metrics",
                    "Geopolitical Risk Indices"
                ],
                profit: "Supply chain disruptions cost companies 3-5% of annual revenue. Predicting these allows for 'Short Supply / Long Competitor' pairs."
            }
        }
    }[vertical] || config.fintech;

    return (
        <section id={id} className="py-20 border-b border-slate-200 last:border-0 bg-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-4">
                    <div className={`p-4 bg-${config.color}-50 rounded-2xl border border-${config.color}-100 shadow-sm`}>
                        {config.icon}
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-2">{config.title}</h2>
                        <p className="text-slate-500 text-lg">Data Alchemy Pipeline: Raw Sources → Profitable Insights</p>
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
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                            <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Available Datasets
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {files.map((file, i) => (
                                    <a
                                        key={i}
                                        href={`${import.meta.env.VITE_API_URL || ''}/api/download/${file.filename}`}
                                        className="block p-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-slate-900">{file.name}</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{file.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <FileText size={12} />
                                            {file.filename}
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Sources & Algo (4 cols) */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Data Sources */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="bg-blue-600 w-1.5 h-5 rounded-full"></span>
                            1. Raw Inputs
                        </h3>
                        <div className="space-y-4">
                            {config.sources.map((s, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                    <div>
                                        <div className="text-slate-500 text-xs mb-0.5">{s.name}</div>
                                        <div className="text-slate-900 font-bold">{s.value}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{s.metric}</div>
                                        <div className="text-emerald-600 text-xs font-mono font-bold">{s.change}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                            <span className="text-xs text-slate-400 font-medium">+ 12 other proprietary signals processed</span>
                        </div>
                    </div>

                    {/* Algo Formula */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="bg-purple-600 w-1.5 h-5 rounded-full"></span>
                            2. Processing
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-900 mb-2">{config.algo.name}</h4>
                            <code className="block bg-white p-3 rounded-lg text-blue-600 font-mono text-xs mb-3 border border-slate-200 break-words">
                                {config.algo.formula}
                            </code>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Output:</span>
                                <span className="text-xl font-bold text-slate-900">{config.algo.output}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Visualization (5 cols) */}
                <div className="xl:col-span-5 flex flex-col">
                    <div className="bg-white rounded-2xl border border-slate-200 p-1 flex-1 flex flex-col shadow-sm">
                        <div className="bg-slate-50 rounded-xl flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                            {/* Background Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                            <div className="w-full relative z-10">
                                {vertical === 'fintech' && <FintechThermograph data={latest} />}
                                {vertical === 'ai_talent' && <AiAirportBoard data={latest} />}
                                {vertical === 'esg' && <EsgPressureChamber data={latest} />}
                                {vertical === 'regulatory' && (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={history}>
                                                <defs>
                                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    hide
                                                    domain={[0, 100]}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                                    itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="enforcement_probability_pct"
                                                    name="Enforcement Probability"
                                                    stroke="#ef4444"
                                                    fillOpacity={1}
                                                    fill="url(#colorRisk)"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="regulatory_foresight"
                                                    name="Compliance Readiness"
                                                    stroke="#3b82f6"
                                                    strokeWidth={2}
                                                    strokeDasharray="4 4"
                                                    dot={false}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {vertical === 'supply_chain' && (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={history}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis hide domain={[0, 100]} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="disruption_risk"
                                                    name="Disruption Risk"
                                                    stroke="#f59e0b"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="resilience_score"
                                                    name="Resilience Score"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Insights & Profit (3 cols) */}
                <div className="xl:col-span-3 space-y-8">
                    {/* Actionable Insight */}
                    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span className="bg-emerald-500 w-1.5 h-5 rounded-full"></span>
                            3. Alpha Signal
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">High Confidence</span>
                                <span className="text-slate-400 text-xs">{latest.date}</span>
                            </div>
                            <p className="text-slate-900 font-medium leading-relaxed text-sm">
                                "{latest.premium_insight}"
                            </p>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h5 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                            <Info size={14} className="text-blue-600" /> Why This Creates Profit
                        </h5>
                        <p className="text-slate-500 text-xs leading-relaxed mb-4">
                            {config.explanation.profit}
                        </p>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h5 className="text-slate-400 font-bold text-[10px] uppercase mb-1">Data Sources</h5>
                            <ul className="list-disc list-inside text-slate-500 text-[10px] space-y-0.5">
                                {config.explanation.data.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductSection;
