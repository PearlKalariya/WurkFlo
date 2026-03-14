'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Modal from '@/components/ui/modal';
import Badge, { getPriorityVariant, getStatusVariant } from '@/components/ui/badge';
import type { Task, TaskStatus, TaskPriority, Project } from '@/types/database';
import { Plus, Calendar, User, GripVertical } from 'lucide-react';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
    { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

// Sortable Task Card
function TaskCard({ task, overlay }: { task: Task; overlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={!overlay ? setNodeRef : undefined}
            style={!overlay ? style : undefined}
            className={`bg-[#1a1a2e] border border-white/[0.06] rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-white/[0.12] transition-all group ${isDragging ? 'opacity-40' : ''
                }`}
            {...(!overlay ? { ...attributes, ...listeners } : {})}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-white flex-1">{task.title}</h4>
                <GripVertical className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            {task.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                    {task.story_points > 0 && (
                        <span className="text-xs text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                            {task.story_points} SP
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {task.due_date && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                    {task.assignee_id && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <User className="w-3 h-3 text-indigo-400" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BoardPage() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
    const [showCreate, setShowCreate] = useState(false);
    const [createColumn, setCreateColumn] = useState<TaskStatus>('backlog');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchTasks();
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

    async function fetchTasks() {
        setLoading(true);
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', selectedProject)
            .order('updated_at', { ascending: false });
        setTasks(data || []);
        setLoading(false);
    }

    function handleDragStart(event: DragStartEvent) {
        const task = event.active.data.current?.task as Task;
        if (task) setActiveTask(task);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        // Check if dropped on a column
        const targetColumn = COLUMNS.find((c) => c.id === over.id);
        if (targetColumn) {
            const task = tasks.find((t) => t.id === taskId);
            if (task && task.status !== targetColumn.id) {
                // Optimistic update
                setTasks((prev) =>
                    prev.map((t) => (t.id === taskId ? { ...t, status: targetColumn.id } : t))
                );
                await supabase.from('tasks').update({ status: targetColumn.id }).eq('id', taskId);
            }
        } else {
            // Dropped on another task — get that task's column
            const overTask = tasks.find((t) => t.id === over.id);
            if (overTask) {
                const task = tasks.find((t) => t.id === taskId);
                if (task && task.status !== overTask.status) {
                    setTasks((prev) =>
                        prev.map((t) => (t.id === taskId ? { ...t, status: overTask.status } : t))
                    );
                    await supabase.from('tasks').update({ status: overTask.status }).eq('id', taskId);
                }
            }
        }
    }

    async function createTask(formData: FormData) {
        const task = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as TaskPriority,
            story_points: parseInt(formData.get('story_points') as string) || 0,
            due_date: (formData.get('due_date') as string) || null,
            status: createColumn,
            project_id: selectedProject,
        };

        await supabase.from('tasks').insert(task);
        setShowCreate(false);
        fetchTasks();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage tasks with drag and drop</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="">Select Project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedProject ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-gray-500 text-sm">Select a project to view its board</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {COLUMNS.map((column) => {
                            const columnTasks = tasks.filter((t) => t.status === column.id);
                            return (
                                <div
                                    key={column.id}
                                    className="flex-shrink-0 w-72"
                                >
                                    <SortableContext
                                        id={column.id}
                                        items={columnTasks.map((t) => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="bg-[#12121a] border border-white/[0.06] rounded-2xl overflow-hidden">
                                            {/* Column Header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                                    <span className="text-sm font-medium text-white">
                                                        {column.title}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                                                        {columnTasks.length}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setCreateColumn(column.id);
                                                        setShowCreate(true);
                                                    }}
                                                    className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Tasks */}
                                            <div className="p-2 space-y-2 min-h-[200px]" id={column.id}>
                                                {columnTasks.map((task) => (
                                                    <TaskCard key={task.id} task={task} />
                                                ))}
                                            </div>
                                        </div>
                                    </SortableContext>
                                </div>
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} overlay /> : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* Create Task Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
                <form action={createTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                        <input
                            name="title"
                            required
                            placeholder="Task title"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Task description..."
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
                            <select
                                name="priority"
                                defaultValue="medium"
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Story Points</label>
                            <input
                                name="story_points"
                                type="number"
                                defaultValue={0}
                                min={0}
                                className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Due Date</label>
                        <input
                            name="due_date"
                            type="date"
                            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                            Create Task
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
