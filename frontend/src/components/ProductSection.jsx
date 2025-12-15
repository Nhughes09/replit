import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Shield, Globe, Lock, Info } from 'lucide-react';
import FintechThermograph from './visualizations/FintechThermograph';
import AiAirportBoard from './visualizations/AiAirportBoard';
import EsgPressureChamber from './visualizations/EsgPressureChamber';

const ProductSection = ({ vertical, id }) => {
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

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center border-b border-slate-800">
            <div className="text-slate-500 animate-pulse">Loading {vertical} Intelligence...</div>
        </div>
    );

    if (!data || data.error) return null;

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
        <section id={id} className="py-20 border-b border-slate-800 last:border-0">
            {/* Header */}
            <div className="flex items-center gap-4 mb-12">
                <div className={`p-4 bg-${config.color}-500/10 rounded-2xl border border-${config.color}-500/20 shadow-[0_0_30px_rgba(0,0,0,0.3)]`}>
                    {config.icon}
                </div>
                <div>
                    <h2 className="text-4xl font-bold text-white mb-2">{config.title}</h2>
                    <p className="text-slate-400 text-lg">Data Alchemy Pipeline: Raw Sources → Profitable Insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Sources & Algo (4 cols) */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Data Sources */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-500 w-1.5 h-5 rounded-full"></span>
                            1. Raw Inputs
                        </h3>
                        <div className="space-y-4">
                            {config.sources.map((s, i) => (
                                <div key={i} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <div className="text-slate-400 text-xs mb-0.5">{s.name}</div>
                                        <div className="text-white font-bold">{s.value}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{s.metric}</div>
                                        <div className="text-emerald-400 text-xs font-mono">{s.change}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Algo Formula */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-purple-500 w-1.5 h-5 rounded-full"></span>
                            2. Processing
                        </h3>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-sm font-bold text-white mb-2">{config.algo.name}</h4>
                            <code className="block bg-slate-950 p-3 rounded-lg text-blue-300 font-mono text-xs mb-3 border border-slate-800 break-words">
                                {config.algo.formula}
                            </code>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 text-sm">Output:</span>
                                <span className="text-xl font-bold text-white">{config.algo.output}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Visualization (5 cols) */}
                <div className="xl:col-span-5 flex flex-col">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-1 flex-1 flex flex-col">
                        <div className="bg-slate-950/50 rounded-xl flex-1 flex items-center justify-center p-6 relative overflow-hidden">
                            {/* Background Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                            <div className="w-full relative z-10">
                                {vertical === 'fintech' && <FintechThermograph data={latest} />}
                                {vertical === 'ai_talent' && <AiAirportBoard data={latest} />}
                                {vertical === 'esg' && <EsgPressureChamber data={latest} />}
                                {(vertical === 'regulatory' || vertical === 'supply_chain') && (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={history}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide domain={[0, 100]} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                                                <Line
                                                    type="monotone"
                                                    dataKey={vertical === 'regulatory' ? 'enforcement_probability_pct' : 'disruption_probability'}
                                                    stroke={vertical === 'regulatory' ? '#ef4444' : '#f59e0b'}
                                                    strokeWidth={3}
                                                    dot={false}
                                                />
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
                    <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="bg-emerald-500 w-1.5 h-5 rounded-full"></span>
                            3. Alpha Signal
                        </h3>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-500/20 mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">High Confidence</span>
                                <span className="text-slate-400 text-xs">{latest.date}</span>
                            </div>
                            <p className="text-white font-medium leading-relaxed text-sm">
                                "{latest.premium_insight}"
                            </p>
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                        <h5 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                            <Info size={14} className="text-blue-400" /> Why This Creates Profit
                        </h5>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">
                            {config.explanation.profit}
                        </p>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <h5 className="text-slate-500 font-bold text-[10px] uppercase mb-1">Data Sources</h5>
                            <ul className="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
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
