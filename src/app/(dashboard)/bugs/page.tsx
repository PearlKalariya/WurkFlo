'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/modal';
import Badge, { getSeverityVariant, getStatusVariant } from '@/components/ui/badge';
import type { Bug as BugType, BugSeverity, BugStatus, Project } from '@/types/database';
import { Plus, Bug as BugIcon, AlertTriangle } from 'lucide-react';

export default function BugsPage() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [bugs, setBugs] = useState<BugType[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) fetchBugs();
        else setLoading(false);
    }, [selectedProject]);

    async function fetchProjects() {
        const { data } = await supabase.from('projects').select('*').order('name');
        setProjects(data || []);
        if (!selectedProject && data && data.length > 0) setSelectedProject(data[0].id);
    }

    async function fetchBugs() {
        setLoading(true);
        const { data } = await supabase
            .from('bugs')
            .select('*')
            .eq('project_id', selectedProject)
            .order('created_at', { ascending: false });
        setBugs(data || []);
        setLoading(false);
    }

    async function createBug(formData: FormData) {
        const bug = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            severity: formData.get('severity') as BugSeverity,
            status: 'open' as BugStatus,
            project_id: selectedProject,
        };
        await supabase.from('bugs').insert(bug);
        setShowCreate(false);
        fetchBugs();
    }

    async function updateBugStatus(bugId: string, status: BugStatus) {
        await supabase.from('bugs').update({ status }).eq('id', bugId);
        fetchBugs();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bug Tracker</h1>
                    <p className="text-gray-400 text-sm mt-1">Report and track bugs</p>
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
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-medium hover:from-red-500 hover:to-pink-500 transition-all shadow-lg shadow-red-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            Report Bug
                        </button>
                    )}
                </div>
            </div>

            {!selectedProject ? (
                <div className="flex flex-col items-center py-20">
                    <p className="text-gray-500 text-sm">Select a project to view bugs</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : bugs.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                        <BugIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">No bugs reported</h3>
                    <p className="text-gray-500 text-sm">Looks like things are running smoothly! 🎉</p>
                </div>
            ) : (
                <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase tracking-wider">
                                    Bug
                                </th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="text-xs font-medium text-gray-500 px-6 py-3 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {bugs.map((bug) => (
                                <tr
                                    key={bug.id}
                                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={`w-4 h-4 ${bug.severity === 'critical' ? 'text-red-400' :
                                                    bug.severity === 'high' ? 'text-amber-400' :
                                                        'text-gray-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-white">{bug.title}</p>
                                                {bug.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{bug.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getSeverityVariant(bug.severity)}>{bug.severity}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusVariant(bug.status)}>{bug.status.replace('_', ' ')}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {new Date(bug.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={bug.status}
                                            onChange={(e) => updateBugStatus(bug.id, e.target.value as BugStatus)}
                                            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300 text-xs focus:outline-none"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Bug Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Report Bug">
                <form action={createBug} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                        <input
                            name="title"
                            required
                            placeholder="Bug title"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Steps to reproduce, expected vs actual behavior..."
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Severity</label>
                        <select
                            name="severity"
                            defaultValue="medium"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
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
                            className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-all"
                        >
                            Report Bug
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
