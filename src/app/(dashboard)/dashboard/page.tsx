'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    CheckCircle2,
    Bug,
    Zap,
    Users,
    TrendingUp,
    Clock,
    AlertCircle,
    ArrowUpRight,
} from 'lucide-react';
import Badge, { getStatusVariant } from '@/components/ui/badge';

interface Stats {
    totalTasks: number;
    completedTasks: number;
    totalBugs: number;
    resolvedBugs: number;
    activeSprints: number;
    totalProjects: number;
}

interface RecentTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    updated_at: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalTasks: 0,
        completedTasks: 0,
        totalBugs: 0,
        resolvedBugs: 0,
        activeSprints: 0,
        totalProjects: 0,
    });
    const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();

            const [
                { count: totalTasks },
                { count: completedTasks },
                { count: totalBugs },
                { count: resolvedBugs },
                { count: activeSprints },
                { count: totalProjects },
                { data: recent },
            ] = await Promise.all([
                supabase.from('tasks').select('*', { count: 'exact', head: true }),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
                supabase.from('bugs').select('*', { count: 'exact', head: true }),
                supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
                supabase.from('sprints').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('tasks').select('id, title, status, priority, updated_at').order('updated_at', { ascending: false }).limit(5),
            ]);

            setStats({
                totalTasks: totalTasks || 0,
                completedTasks: completedTasks || 0,
                totalBugs: totalBugs || 0,
                resolvedBugs: resolvedBugs || 0,
                activeSprints: activeSprints || 0,
                totalProjects: totalProjects || 0,
            });
            setRecentTasks(recent || []);
            setLoading(false);
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Tasks Completed',
            value: `${stats.completedTasks}/${stats.totalTasks}`,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/20',
            pct: stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0,
        },
        {
            label: 'Bugs Resolved',
            value: `${stats.resolvedBugs}/${stats.totalBugs}`,
            icon: Bug,
            color: 'from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/20',
            pct: stats.totalBugs ? Math.round((stats.resolvedBugs / stats.totalBugs) * 100) : 0,
        },
        {
            label: 'Active Sprints',
            value: stats.activeSprints,
            icon: Zap,
            color: 'from-blue-500 to-cyan-600',
            shadow: 'shadow-blue-500/20',
        },
        {
            label: 'Projects',
            value: stats.totalProjects,
            icon: Users,
            color: 'from-purple-500 to-pink-600',
            shadow: 'shadow-purple-500/20',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Overview of your workspace activity</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                                <card.icon className="w-5 h-5 text-white" />
                            </div>
                            {card.pct !== undefined && (
                                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                    <TrendingUp className="w-3 h-3" />
                                    {card.pct}%
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-sm text-gray-400 mt-1">{card.label}</p>
                        {/* Progress bar for tasks and bugs */}
                        {card.pct !== undefined && (
                            <div className="mt-3 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-700`}
                                    style={{ width: `${card.pct}%` }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Activity & Sprint Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Recent Activity
                        </h2>
                    </div>
                    {recentTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <AlertCircle className="w-8 h-8 text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500">No tasks yet. Create a project and start adding tasks!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{task.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Updated {new Date(task.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge variant={getStatusVariant(task.status)}>
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Developer Workload */}
                <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            Quick Stats
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                                    <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">Sprint Completion</p>
                                    <p className="text-xs text-gray-500">Current sprint progress</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-indigo-400">
                                {stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                                    <Bug className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">Open Bugs</p>
                                    <p className="text-xs text-gray-500">Pending resolution</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-red-400">{stats.totalBugs - stats.resolvedBugs}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">Velocity</p>
                                    <p className="text-xs text-gray-500">Tasks done this cycle</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-400">{stats.completedTasks}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
