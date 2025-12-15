import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Activity, Zap, Shield, Globe, Lock, ArrowRight } from 'lucide-react';

const ProductPage = () => {
    const { vertical } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/preview/${vertical}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [vertical]);

    if (loading) return <div className="text-white p-8">Loading Data Engine...</div>;
    if (!data || data.error) return <div className="text-red-400 p-8">Error loading data: {data?.error}</div>;

    const { latest, history } = data;

    // Config based on vertical
    const config = {
        fintech: {
            title: "Fintech Growth Intelligence",
            icon: <Activity className="text-blue-400" size={32} />,
            color: "blue",
            sources: [
                { name: "App Store Metrics", metric: "Download Velocity", value: latest.download_velocity, change: "+12%" },
                { name: "User Sentiment", metric: "Review Score", value: latest.review_sentiment, change: "+0.2" },
                { name: "Hiring Signals", metric: "Hiring Spike", value: latest.hiring_spike, change: "Active" }
            ],
            algo: {
                name: "Funding Probability Score",
                formula: "Score = (Hiring × 0.3) + (Downloads × 0.25) + (Sentiment × 0.2)",
                output: "87% Probability"
            }
        },
        ai_talent: {
            title: "AI Talent & Capital Prediction",
            icon: <Zap className="text-indigo-400" size={32} />,
            color: "indigo",
            sources: [
                { name: "GitHub Activity", metric: "Star Velocity", value: latest.github_stars_7d, change: "+26" },
                { name: "Research Output", metric: "ArXiv Papers", value: latest.arxiv_papers, change: "5" },
                { name: "Talent Flow", metric: "Talent Score", value: latest.talent_score, change: "High" }
            ],
            algo: {
                name: "Technical Momentum Index",
                formula: "Index = Σ(Citations × Impact) / Time_Decay",
                output: `${latest.technical_momentum}/100`
            }
        },
        esg: {
            title: "ESG Impact & Greenwashing Detector",
            icon: <Shield className="text-emerald-400" size={32} />,
            color: "emerald",
            sources: [
                { name: "Marketing Claims", metric: "Claim Count", value: latest.esg_claims, change: "High" },
                { name: "Audit Logs", metric: "Verified Actions", value: latest.verifiable_actions, change: "Low" },
                { name: "Discrepancy", metric: "Greenwashing Index", value: latest.greenwashing_index, change: "Critical" }
            ],
            algo: {
                name: "Integrity Gap Analysis",
                formula: "Gap = (Claims - Verified) * Sector_Risk_Factor",
                output: "High Risk Detected"
            }
        },
        regulatory: {
            title: "Regulatory Compliance Prediction",
            icon: <Lock className="text-red-400" size={32} />,
            color: "red",
            sources: [
                { name: "Enforcement Logs", metric: "Probability", value: latest.enforcement_probability, change: "High" },
                { name: "Compliance Hiring", metric: "Gap Score", value: latest.compliance_gap, change: "Large" },
                { name: "Whistleblower", metric: "Risk Level", value: latest.whistleblower_risk, change: "Elevated" }
            ],
            algo: {
                name: "Enforcement Risk Heatmap",
                formula: "Risk = P(Action) * Est_Fine_Impact",
                output: `$${latest.fines_estimate}`
            }
        },
        supply_chain: {
            title: "Supply Chain Resilience Intelligence",
            icon: <Globe className="text-amber-400" size={32} />,
            color: "amber",
            sources: [
                { name: "Disruption Risk", metric: "Risk Score", value: latest.disruption_risk, change: "Medium" },
                { name: "Recovery Time", metric: "Days to Recover", value: latest.recovery_days, change: "19 Days" },
                { name: "Inflation", metric: "Cost Impact", value: latest.cost_inflation, change: "2.5%" }
            ],
            algo: {
                name: "Resilience Gauge",
                formula: "Score = 100 - (Risk * Impact * Duration)",
                output: `${latest.resilience_score}/100`
            }
        }
    }[vertical] || config.fintech;

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 bg-${config.color}-500/10 rounded-xl border border-${config.color}-500/20`}>
                    {config.icon}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                    <p className="text-slate-400">Data Alchemy Pipeline: Raw Sources → Profitable Insights</p>
                </div>
            </div>

            {/* SECTION 1: DATA SOURCES */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-blue-500 w-2 h-6 rounded-full"></span>
                    1. Raw Data Sources (Collected Daily)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {config.sources.map((s, i) => (
                        <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                            <div className="text-slate-400 text-sm mb-1">{s.name}</div>
                            <div className="text-2xl font-bold text-white mb-2">{s.value}</div>
                            <div className="flex justify-between items-end">
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{s.metric}</div>
                                <div className="text-emerald-400 text-sm font-mono">{s.change}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 2: PROPRIETARY PROCESSING */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-purple-500 w-2 h-6 rounded-full"></span>
                    2. Proprietary Processing (The Secret Sauce)
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800 w-full">
                        <h4 className="text-lg font-bold text-white mb-4">{config.algo.name}</h4>
                        <code className="block bg-slate-950 p-4 rounded-lg text-blue-300 font-mono text-sm mb-4 border border-slate-800">
                            {config.algo.formula}
                        </code>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Calculated Output:</span>
                            <span className="text-2xl font-bold text-white">{config.algo.output}</span>
                        </div>
                    </div>
                    <div className="hidden md:block text-slate-600">
                        <ArrowRight size={32} />
                    </div>
                    <div className="flex-1 w-full h-64 bg-slate-900 rounded-xl border border-slate-800 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={vertical === 'fintech' ? 'adoption_velocity' :
                                        vertical === 'ai_talent' ? 'technical_momentum' :
                                            vertical === 'esg' ? 'greenwashing_index' :
                                                vertical === 'regulatory' ? 'enforcement_probability' : 'disruption_risk'}
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* SECTION 3: INSIGHTS */}
            <section className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-emerald-500 w-2 h-6 rounded-full"></span>
                    3. Actionable Intelligence (Profit Generator)
                </h3>
                <div className="bg-slate-900/80 p-6 rounded-xl border border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">High Confidence Signal</span>
                        <span className="text-slate-400 text-sm">{latest.date}</span>
                    </div>
                    <p className="text-xl text-white font-medium leading-relaxed">
                        "{latest.premium_insight}"
                    </p>
                    <div className="mt-6 pt-6 border-t border-slate-800 flex gap-6">
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Target Entity</div>
                            <div className="text-white font-bold">{latest.company}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Signal Strength</div>
                            <div className="text-emerald-400 font-bold">94/100</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: ROI */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-amber-500 w-2 h-6 rounded-full"></span>
                    4. Historical Track Record
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">89%</div>
                        <div className="text-slate-500 text-sm">Signal Accuracy</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">$4.2M</div>
                        <div className="text-slate-500 text-sm">Avg. Client ROI</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">18 Days</div>
                        <div className="text-slate-500 text-sm">Lead Time Advantage</div>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-white mb-4">Case Study: Global Hedge Fund A</h4>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-24 text-slate-500 text-sm">Jan 15</div>
                            <div className="text-slate-300 text-sm">Signal: "Revolut hiring spike +230%"</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 text-slate-500 text-sm">Mar 01</div>
                            <div className="text-slate-300 text-sm">Event: Revolut raises $500M at $40B valuation</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24 text-emerald-500 text-sm font-bold">Result</div>
                            <div className="text-emerald-400 text-sm font-bold">Client Profit: $1.6M (32% ROI)</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductPage;
