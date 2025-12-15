import React from 'react';
import { LayoutDashboard, TrendingUp, Zap, Shield, Lock, Globe, Database } from 'lucide-react';

const Layout = ({ children }) => {
    const navItems = [
        { name: 'Overview', path: '#top', icon: <LayoutDashboard size={20} /> },
        { name: 'Fintech Growth', path: '#fintech', icon: <TrendingUp size={20} /> },
        { name: 'AI Talent', path: '#ai_talent', icon: <Zap size={20} /> },
        { name: 'ESG Impact', path: '#esg', icon: <Shield size={20} /> },
        { name: 'Regulatory', path: '#regulatory', icon: <Lock size={20} /> },
        { name: 'Supply Chain', path: '#supply_chain', icon: <Globe size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex" id="top">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed h-full z-50 hidden md:block">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Database size={24} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">HHeuristics</span>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </a>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-mono text-emerald-500">SYSTEM ONLINE</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 relative">
                {children}
            </main>
        </div>
    );
};

export default Layout;
