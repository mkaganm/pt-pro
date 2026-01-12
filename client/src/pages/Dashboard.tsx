import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import SessionCard from '../components/sessions/SessionCard';
import { useClientStore } from '../store/useClientStore';
import { useSessionStore } from '../store/useSessionStore';

export default function Dashboard() {
    const { t } = useTranslation();
    const { clients, fetchClients } = useClientStore();
    const { sessions, fetchSessions } = useSessionStore();

    useEffect(() => {
        fetchClients();
        fetchSessions();
    }, [fetchClients, fetchSessions]);

    // Calculate stats
    const totalClients = clients.length;
    const totalSessions = sessions.length;

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.scheduled_at);
        return sessionDate >= today && sessionDate < tomorrow;
    });

    // Get upcoming sessions (next 5, after today)
    const upcomingSessions = sessions
        .filter((session) => {
            const sessionDate = new Date(session.scheduled_at);
            return sessionDate >= tomorrow && session.status === 'scheduled';
        })
        .slice(0, 5);

    // Weekly stats
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklySessions = sessions.filter((session) => {
        const sessionDate = new Date(session.scheduled_at);
        return sessionDate >= weekStart && sessionDate < weekEnd;
    });

    const weeklyCompleted = weeklySessions.filter((s) => s.status === 'completed').length;
    const weeklyNoShow = weeklySessions.filter((s) => s.status === 'no_show').length;

    const stats = [
        { label: t('dashboard.totalClients'), value: totalClients, icon: Users, color: 'text-blue-400' },
        { label: t('dashboard.totalSessions'), value: totalSessions, icon: Calendar, color: 'text-primary' },
        { label: t('dashboard.weeklyStats'), value: weeklyCompleted, icon: TrendingUp, color: 'text-green-400' },
        { label: t('sessions.noShow'), value: weeklyNoShow, icon: Clock, color: 'text-red-400' },
    ];

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">{t('dashboard.title')}</h1>
                <p className="text-gray-400 mt-1">
                    {new Date().toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-dark-200 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-gray-400">{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Today's Sessions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.todaySessions')}</h2>
                {todaySessions.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p className="text-gray-400">{t('dashboard.noSessionsToday')}</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {todaySessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Sessions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.upcomingSessions')}</h2>
                {upcomingSessions.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p className="text-gray-400">{t('dashboard.noUpcoming')}</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {upcomingSessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
