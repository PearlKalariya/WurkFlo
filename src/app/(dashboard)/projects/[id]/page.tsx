'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Badge, { getStatusVariant } from '@/components/ui/badge';
import { Columns3, Zap, Bug, Rocket, FolderKanban } from 'lucide-react';
import type { Project } from '@/types/database';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [taskCount, setTaskCount] = useState(0);
    const [bugCount, setBugCount] = useState(0);
    const [sprintCount, setSprintCount] = useState(0);

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const [{ data: proj }, { count: tc }, { count: bc }, { count: sc }] = await Promise.all([
                supabase.from('projects').select('*').eq('id', projectId).single(),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
                supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
                supabase.from('sprints').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
            ]);
            setProject(proj);
            setTaskCount(tc || 0);
            setBugCount(bc || 0);
            setSprintCount(sc || 0);
        }
        load();
    }, [projectId]);

    if (!project) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const modules = [
        { name: 'Kanban Board', href: `/board?project=${projectId}`, icon: Columns3, desc: 'Drag-and-drop task management', count: taskCount, color: 'from-blue-500 to-cyan-500' },
        { name: 'Sprints', href: `/sprints?project=${projectId}`, icon: Zap, desc: 'Sprint planning and tracking', count: sprintCount, color: 'from-amber-500 to-orange-500' },
        { name: 'Bug Tracker', href: `/bugs?project=${projectId}`, icon: Bug, desc: 'Report and track bugs', count: bugCount, color: 'from-red-500 to-pink-500' },
        { name: 'Releases', href: `/releases?project=${projectId}`, icon: Rocket, desc: 'Release management', count: 0, color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                    <p className="text-gray-400 text-sm mt-1">{project.description || 'No description'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod) => (
                    <Link key={mod.name} href={mod.href}>
                        <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}>
                                    <mod.icon className="w-5 h-5 text-white" />
                                </div>
                                <Badge variant="default">{mod.count} items</Badge>
                            </div>
                            <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">{mod.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{mod.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
