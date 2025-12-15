import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, ArrowUpRight, Clock, Server } from 'lucide-react';

const Dashboard = () => {
    const [status, setStatus] = useState({ last_update: 'Loading...', data_added: '...' });
    const [catalog, setCatalog] = useState({});

    useEffect(() => {
        fetch('/api/catalog')
            .then(res => res.json())
            .then(data => {
                setStatus(data.system_status);
                setCatalog(data.verticals);
            })
            .catch(err => console.error(err));
    }, []);

    const stats = [
        { label: 'Total Data Volume', value: '8.4 GB', icon: <Database className="text-blue-400" /> },
        { label: 'Daily Records', value: '+9,000', icon: <ArrowUpRight className="text-emerald-400" /> },
        { label: 'Last Update', value: status.last_update, icon: <Clock className="text-amber-400" /> },
        { label: 'System Status', value: 'Active', icon: <Server className="text-purple-400" /> },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Data Overview</h2>
                <p className="text-slate-400">Real-time status of the HHeuristics Premium Data Engine.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-800 border border-slate-700 p-6 rounded-xl"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-slate-700/50 rounded-lg">{stat.icon}</div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Products Grid */}
            <h3 className="text-xl font-bold text-white mt-8 mb-4">Available Data Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(catalog).map(([name, files], i) => (
                    <Link
                        key={i}
                        to={`/product/${name.split(' ')[0].toLowerCase() === 'fintech' ? 'fintech' :
                            name.split(' ')[0].toLowerCase() === 'ai' ? 'ai_talent' :
                                name.split(' ')[0].toLowerCase() === 'esg' ? 'esg' :
                                    name.split(' ')[0].toLowerCase() === 'regulatory' ? 'regulatory' : 'supply_chain'}`}
                        className="group bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{name}</h4>
                            <ArrowUpRight className="text-slate-600 group-hover:text-blue-400 transition-colors" size={20} />
                        </div>
                        <p className="text-sm text-slate-400 mb-6">
                            {files.length} datasets available. Updated daily.
                        </p>
                        <div className="flex gap-2">
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">CSV</span>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">REST API</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
