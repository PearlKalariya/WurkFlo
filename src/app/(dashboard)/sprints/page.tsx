'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/modal';
import Badge, { getStatusVariant } from '@/components/ui/badge';
import type { Sprint, SprintStatus, Project, Task } from '@/types/database';
import { Plus, Zap, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function SprintsPage() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sprintTasks, setSprintTasks] = useState<Record<string, { total: number; done: number }>>({});

    const supabase = createClient();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchSprints();
        } else {
            setLoading(false);
        }
    }, [selectedProject]);

    async function fetchProjects() {
        const { data } = await supabase.from('projects').select('*').order('name');
        setProjects(data || []);
        if (!selectedProject && data && data.length > 0) {
            setSelectedProject(data[0].id);
        }
    }

    async function fetchSprints() {
        setLoading(true);
        const { data: sprintsData } = await supabase
            .from('sprints')
            .select('*')
            .eq('project_id', selectedProject)
            .order('start_date', { ascending: false });

        setSprints(sprintsData || []);

        // Fetch task counts for each sprint
        if (sprintsData && sprintsData.length > 0) {
            const counts: Record<string, { total: number; done: number }> = {};
            await Promise.all(
                sprintsData.map(async (sprint) => {
                    const [{ count: total }, { count: done }] = await Promise.all([
                        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('sprint_id', sprint.id),
                        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('sprint_id', sprint.id).eq('status', 'done'),
                    ]);
                    counts[sprint.id] = { total: total || 0, done: done || 0 };
                })
            );
            setSprintTasks(counts);
        }

        setLoading(false);
    }

    async function createSprint(formData: FormData) {
        const sprint = {
            name: formData.get('name') as string,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            status: 'planning' as SprintStatus,
            project_id: selectedProject,
        };

        await supabase.from('sprints').insert(sprint);
        setShowCreate(false);
        fetchSprints();
    }

    async function updateSprintStatus(sprintId: string, status: SprintStatus) {
        await supabase.from('sprints').update({ status }).eq('id', sprintId);
        fetchSprints();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sprints</h1>
                    <p className="text-gray-400 text-sm mt-1">Plan and track your sprint cycles</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="">Select Project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {selectedProject && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            New Sprint
                        </button>
                    )}
                </div>
            </div>

            {!selectedProject ? (
                <div className="flex flex-col items-center py-20">
                    <p className="text-gray-500 text-sm">Select a project to view sprints</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : sprints.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">No sprints yet</h3>
                    <p className="text-gray-500 text-sm">Create your first sprint to plan work cycles.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sprints.map((sprint) => {
                        const st = sprintTasks[sprint.id] || { total: 0, done: 0 };
                        const pct = st.total > 0 ? Math.round((st.done / st.total) * 100) : 0;

                        return (
                            <div
                                key={sprint.id}
                                className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">{sprint.name}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(sprint.start_date), 'MMM d')} – {format(new Date(sprint.end_date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getStatusVariant(sprint.status)}>
                                            {sprint.status}
                                        </Badge>
                                        <select
                                            value={sprint.status}
                                            onChange={(e) => updateSprintStatus(sprint.id, e.target.value as SprintStatus)}
                                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300 text-xs focus:outline-none"
                                        >
                                            <option value="planning">Planning</option>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs text-gray-400">Progress</span>
                                            <span className="text-xs text-gray-400">
                                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                                {st.done}/{st.total} tasks
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-amber-400">{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Sprint Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Sprint">
                <form action={createSprint} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Sprint Name</label>
                        <input
                            name="name"
                            required
                            placeholder="Sprint 1"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date</label>
                            <input
                                name="start_date"
                                type="date"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">End Date</label>
                            <input
                                name="end_date"
                                type="date"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-all"
                        >
                            Create Sprint
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
