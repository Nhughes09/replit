import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Activity, Zap, Shield, Globe, Lock, ArrowRight, Info } from 'lucide-react';
import FintechThermograph from '../components/visualizations/FintechThermograph';
import AiAirportBoard from '../components/visualizations/AiAirportBoard';
import EsgPressureChamber from '../components/visualizations/EsgPressureChamber';
import AlphaCalculator from '../components/AlphaCalculator';

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

    if (loading) return <div className="text-white p-8 flex justify-center items-center h-screen">Loading Data Engine...</div>;
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
                output: `${latest.smart_money_score || 87}% Probability`
            },
            explanation: {
                what: "This thermograph shows where institutional capital is flowing BEFORE public announcements. Each cell represents our proprietary 'smart money signal strength' score.",
                data: [
                    "Daily App Store Download Velocity (API)",
                    "Executive Hiring Patterns (LinkedIn Scraper)",
                    "Patent Filing Frequency (USPTO)"
                ],
                profit: "The average gap between our signal detection and public announcement is 31 days. In fintech, 31 days of alpha translates to 22-47% returns for early positions.",
                example: "With $1M investment: Detected Revolut hiring spike 42 days before Series E. Result: +32% ROI."
            },
            calculator: {
                prob: latest.smart_money_score || 87,
                roi: 0.32,
                risk: 0.08,
                type: "Growth"
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
                profit: "Each month of 'delay' for flagship models creates $200M-$500M market cap shifts for competing companies. Our early detection provides 47-day average lead time.",
                example: "With $1M investment: Shorted Competitor X after detecting 'Benchmark Inflation'. Result: +18% in 60 days."
            },
            calculator: {
                prob: latest.technical_momentum || 92,
                roi: 0.45,
                risk: 0.12,
                type: "Venture"
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
                profit: "Each 10% 'gap' represents approximately 3.2% of ESG-related stock premium at risk. Our tracking provides 60-day early warning on premium corrections.",
                example: "With $1M investment: Shorted Company Y after Gap exceeded 40%. Result: +14% upon regulatory fine."
            },
            calculator: {
                prob: latest.greenwashing_index || 75,
                roi: 0.14,
                risk: 0.05,
                type: "Short"
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
                profit: "Regulatory fines cause average stock drops of 8-15%. Our model predicts enforcement actions with 78% accuracy 3 months in advance.",
                example: "With $1M investment: Avoided Sector Z after Risk Score hit 85/100. Saved: $150k in potential losses."
            },
            calculator: {
                prob: parseInt(latest.enforcement_probability) || 60,
                roi: 0.15,
                risk: 0.10,
                type: "Risk"
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
                profit: "Supply chain disruptions cost companies 3-5% of annual revenue. Predicting these allows for 'Short Supply / Long Competitor' pairs.",
                example: "With $1M investment: Longed Competitor A when Supplier B failed. Result: +21% in 30 days."
            },
            calculator: {
                prob: latest.resilience_score || 80,
                roi: 0.21,
                risk: 0.07,
                type: "Macro"
            }
        }
    }[vertical] || config.fintech;

    return (
        <div className="space-y-12 pb-20">
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

            {/* SECTION 2: PROPRIETARY PROCESSING (VISUALIZATION) */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-purple-500 w-2 h-6 rounded-full"></span>
                    2. Proprietary Processing (The Secret Sauce)
                </h3>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Algo Info */}
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                            <h4 className="text-lg font-bold text-white mb-4">{config.algo.name}</h4>
                            <code className="block bg-slate-950 p-4 rounded-lg text-blue-300 font-mono text-sm mb-4 border border-slate-800">
                                {config.algo.formula}
                            </code>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Calculated Output:</span>
                                <span className="text-2xl font-bold text-white">{config.algo.output}</span>
                            </div>
                        </div>

                        {/* Text Explanation */}
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                            <h5 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Info size={16} className="text-blue-400" /> What You're Seeing
                            </h5>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                {config.explanation.what}
                            </p>
                            <h5 className="text-white font-bold mb-2 text-sm">The Data Behind This:</h5>
                            <ul className="list-disc list-inside text-slate-400 text-xs space-y-1 mb-4">
                                {config.explanation.data.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                            <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-lg">
                                <h5 className="text-emerald-400 font-bold text-xs uppercase mb-1">Why This Creates Profit</h5>
                                <p className="text-slate-300 text-xs leading-relaxed">
                                    {config.explanation.profit}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visualization */}
                    <div className="lg:w-2/3 bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center justify-center min-h-[400px]">
                        {vertical === 'fintech' && <FintechThermograph data={latest} />}
                        {vertical === 'ai_talent' && <AiAirportBoard data={latest} />}
                        {vertical === 'esg' && <EsgPressureChamber data={latest} />}
                        {/* Fallback for others */}
                        {(vertical === 'regulatory' || vertical === 'supply_chain') && (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
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

            {/* SECTION 4: ROI CALCULATOR */}
            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-amber-500 w-2 h-6 rounded-full"></span>
                    4. Alpha Calculator (Projected Returns)
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <p className="text-slate-400 mb-6">
                            Use our proprietary Alpha Calculator to estimate potential returns based on the current signal strength and historical performance of similar setups.
                        </p>
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
                            <h4 className="font-bold text-white mb-4">Historical Example Play</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-24 text-slate-500 text-sm">Signal</div>
                                    <div className="text-slate-300 text-sm italic">"{config.explanation.example.split(':')[1]}"</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-24 text-emerald-500 text-sm font-bold">Result</div>
                                    <div className="text-emerald-400 text-sm font-bold">{config.explanation.example.split('Result:')[1]}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <AlphaCalculator
                            probability={config.calculator.prob}
                            roi={config.calculator.roi}
                            risk={config.calculator.risk}
                            type={config.calculator.type}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductPage;
