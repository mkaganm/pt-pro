import type { SessionStatus } from '../../types';

interface StatusBadgeProps {
    status: SessionStatus;
    size?: 'sm' | 'md';
}

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
    scheduled: {
        label: 'Scheduled',
        className: 'bg-blue-500/20 text-blue-400',
    },
    completed: {
        label: 'Completed',
        className: 'bg-green-500/20 text-green-400',
    },
    no_show: {
        label: 'No Show',
        className: 'bg-red-500/20 text-red-400',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-gray-500/20 text-gray-400',
    },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const config = statusConfig[status];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses}`}>
            {config.label}
        </span>
    );
}
