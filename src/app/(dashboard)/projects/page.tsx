'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/ui/modal';
import { Plus, FolderKanban, MoreHorizontal } from 'lucide-react';
import type { Project } from '@/types/database';
import Link from 'next/link';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        const { data } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        setProjects(data || []);
        setLoading(false);
    }

    async function createProject(formData: FormData) {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('projects').insert({
            name,
            description,
            owner_id: user.id,
        });

        setShowCreate(false);
        fetchProjects();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your development projects</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                        <FolderKanban className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">No projects yet</h3>
                    <p className="text-gray-500 text-sm max-w-md">
                        Create your first project to start managing tasks, sprints, and releases.
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-all"
                    >
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                        <FolderKanban className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {project.description || 'No description'}
                                </p>
                                <p className="text-xs text-gray-600 mt-3">
                                    Created {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
                <form action={createProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Name</label>
                        <input
                            name="name"
                            required
                            placeholder="My Awesome Project"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Brief description of your project..."
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
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-all"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
