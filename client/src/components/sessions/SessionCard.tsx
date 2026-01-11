import { Clock, User } from 'lucide-react';
import type { Session } from '../../types';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';

interface SessionCardProps {
    session: Session;
    showClient?: boolean;
    onClick?: () => void;
}

export default function SessionCard({ session, showClient = true, onClick }: SessionCardProps) {
    const scheduledDate = new Date(session.scheduled_at);
    const timeStr = scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = scheduledDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

    return (
        <Card hover={!!onClick} onClick={onClick}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="text-center min-w-[60px]">
                        <p className="text-xl font-bold text-white">{timeStr}</p>
                        <p className="text-xs text-gray-500">{dateStr}</p>
                    </div>

                    <div className="w-px h-12 bg-dark-100" />

                    {/* Info */}
                    <div>
                        {showClient && session.client && (
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-white">
                                    {session.client.first_name} {session.client.last_name}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{session.duration_minutes} min</span>
                            </div>
                            <StatusBadge status={session.status} size="sm" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
