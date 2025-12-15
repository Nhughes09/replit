import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Zap, Shield, Activity, Globe } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Fintech Growth', path: '/product/fintech', icon: <TrendingUp size={20} /> },
        { name: 'AI Talent', path: '/product/ai_talent', icon: <Zap size={20} /> },
        { name: 'ESG Impact', path: '/product/esg', icon: <Shield size={20} /> },
        { name: 'Regulatory Risk', path: '/product/regulatory', icon: <Activity size={20} /> },
        { name: 'Supply Chain', path: '/product/supply_chain', icon: <Globe size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        HHeuristics
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Premium Data Engine</p>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
