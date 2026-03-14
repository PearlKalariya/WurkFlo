'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FolderKanban,
    Columns3,
    Zap,
    Bug,
    Rocket,
    Workflow,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Kanban Board', href: '/board', icon: Columns3 },
    { name: 'Sprints', href: '/sprints', icon: Zap },
    { name: 'Bug Tracker', href: '/bugs', icon: Bug },
    { name: 'Releases', href: '/releases', icon: Rocket },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-[#0d0d14] border-r border-white/[0.06] flex flex-col z-30 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                    <Workflow className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-white tracking-tight">WurkFlo</span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-600/15 text-indigo-400'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                }`}
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'
                                    }`}
                            />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <div className="p-3 border-t border-white/[0.06]">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center justify-center w-full py-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>
        </aside>
    );
}
