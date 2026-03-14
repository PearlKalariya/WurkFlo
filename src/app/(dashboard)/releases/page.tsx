'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/modal';
import Badge, { getStatusVariant } from '@/components/ui/badge';
import type { Release, ReleaseStatus, Project } from '@/types/database';
import { Plus, Rocket, Package, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function ReleasesPage() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [releases, setReleases] = useState<Release[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
    const [showCreate, setShowCreate] = useState(false);
    const [showNotes, setShowNotes] = useState<Release | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) fetchReleases();
        else setLoading(false);
    }, [selectedProject]);

    async function fetchProjects() {
        const { data } = await supabase.from('projects').select('*').order('name');
        setProjects(data || []);
        if (!selectedProject && data && data.length > 0) setSelectedProject(data[0].id);
    }

    async function fetchReleases() {
        setLoading(true);
        const { data } = await supabase
            .from('releases')
            .select('*')
            .eq('project_id', selectedProject)
            .order('created_at', { ascending: false });
        setReleases(data || []);
        setLoading(false);
    }

    async function createRelease(formData: FormData) {
        const release = {
            version: formData.get('version') as string,
            release_date: (formData.get('release_date') as string) || null,
            notes: (formData.get('notes') as string) || null,
            status: 'planned' as ReleaseStatus,
            project_id: selectedProject,
        };
        await supabase.from('releases').insert(release);
        setShowCreate(false);
        fetchReleases();
    }

    async function updateReleaseStatus(releaseId: string, status: ReleaseStatus) {
        await supabase.from('releases').update({ status }).eq('id', releaseId);
        fetchReleases();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Releases</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage release versions and notes</p>
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
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
                        >
                            <Plus className="w-4 h-4" />
                            New Release
                        </button>
                    )}
                </div>
            </div>

            {!selectedProject ? (
                <div className="flex flex-col items-center py-20">
                    <p className="text-gray-500 text-sm">Select a project to view releases</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : releases.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <Rocket className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">No releases yet</h3>
                    <p className="text-gray-500 text-sm">Create your first release to start shipping versions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {releases.map((release) => (
                        <div
                            key={release.id}
                            className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">v{release.version}</h3>
                                        {release.release_date && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {format(new Date(release.release_date), 'MMM d, yyyy')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge variant={getStatusVariant(release.status)}>
                                    {release.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            {release.notes && (
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{release.notes}</p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                <select
                                    value={release.status}
                                    onChange={(e) => updateReleaseStatus(release.id, e.target.value as ReleaseStatus)}
                                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-300 text-xs focus:outline-none"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="released">Released</option>
                                </select>
                                {release.notes && (
                                    <button
                                        onClick={() => setShowNotes(release)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-purple-400 hover:bg-white/[0.04] transition-all"
                                    >
                                        <FileText className="w-3 h-3" />
                                        Release Notes
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Release Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Release">
                <form action={createRelease} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Version</label>
                        <input
                            name="version"
                            required
                            placeholder="1.0.0"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Release Date</label>
                        <input
                            name="release_date"
                            type="date"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Release Notes</label>
                        <textarea
                            name="notes"
                            rows={4}
                            placeholder="What's new in this release..."
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-none"
                        />
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
                            className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-all"
                        >
                            Create Release
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Release Notes Modal */}
            <Modal isOpen={!!showNotes} onClose={() => setShowNotes(null)} title={`Release Notes - v${showNotes?.version || ''}`}>
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap">{showNotes?.notes}</p>
                </div>
            </Modal>
        </div>
    );
}
