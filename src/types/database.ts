export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SprintStatus = 'planning' | 'active' | 'completed';
export type ReleaseStatus = 'planned' | 'in_progress' | 'released';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    project_id: string;
    sprint_id: string | null;
    assignee_id: string | null;
    priority: TaskPriority;
    story_points: number;
    status: TaskStatus;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    assignee?: Profile;
    sprint?: Sprint;
}

export interface Sprint {
    id: string;
    project_id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: SprintStatus;
    created_at: string;
    updated_at: string;
}

export interface Bug {
    id: string;
    title: string;
    description: string | null;
    project_id: string;
    related_task_id: string | null;
    assignee_id: string | null;
    severity: BugSeverity;
    status: BugStatus;
    created_at: string;
    updated_at: string;
    assignee?: Profile;
    related_task?: Task;
}

export interface Release {
    id: string;
    project_id: string;
    version: string;
    release_date: string | null;
    status: ReleaseStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Comment {
    id: string;
    task_id: string | null;
    bug_id: string | null;
    user_id: string;
    content: string;
    created_at: string;
    author?: Profile;
}

export interface ReleaseTask {
    release_id: string;
    task_id: string;
    task?: Task;
}

// Simplified Database type - avoids strict Omit types that cause inference issues with Supabase client
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            projects: {
                Row: Project;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            tasks: {
                Row: Task;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            sprints: {
                Row: Sprint;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            bugs: {
                Row: Bug;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            releases: {
                Row: Release;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            comments: {
                Row: Comment;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
            release_tasks: {
                Row: ReleaseTask;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            task_status: TaskStatus;
            task_priority: TaskPriority;
            bug_severity: BugSeverity;
            sprint_status: SprintStatus;
            release_status: ReleaseStatus;
            bug_status: BugStatus;
        };
    };
}
