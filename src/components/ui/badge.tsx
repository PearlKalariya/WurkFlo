export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/15 text-red-400 border-red-500/20',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${variantClasses[variant]}`}
        >
            {children}
        </span>
    );
}

// Helper to map priority / severity / status to badge variants
export function getPriorityVariant(priority: string): BadgeVariant {
    switch (priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'default';
    }
}

export function getSeverityVariant(severity: string): BadgeVariant {
    switch (severity) {
        case 'critical': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'default';
        default: return 'default';
    }
}

export function getStatusVariant(status: string): BadgeVariant {
    switch (status) {
        case 'done':
        case 'completed':
        case 'resolved':
        case 'released':
            return 'success';
        case 'in_progress':
        case 'active':
            return 'info';
        case 'review':
            return 'purple';
        case 'open':
        case 'planning':
        case 'planned':
            return 'warning';
        case 'backlog':
        case 'todo':
        case 'closed':
            return 'default';
        default:
            return 'default';
    }
}
