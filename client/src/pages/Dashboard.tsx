import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, TrendingUp, Clock, Edit2, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import SessionCalendar from '../components/common/SessionCalendar';
import { useClientStore } from '../store/useClientStore';
import { useSessionStore } from '../store/useSessionStore';
import { sessionsApi } from '../api/endpoints';

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { clients, fetchClients } = useClientStore();
    const { sessions, fetchSessions } = useSessionStore();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

    // Get all future sessions (sorted)
    const allFutureSessions = sessions
        .filter((session) => {
            const sessionDate = new Date(session.scheduled_at);
            return sessionDate >= tomorrow;
        })
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    // Selected date sessions
    const selectedDateSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.scheduled_at);
        const targetDate = new Date(selectedDate);
        targetDate.setHours(0, 0, 0, 0);
        const targetNextDay = new Date(targetDate);
        targetNextDay.setDate(targetNextDay.getDate() + 1);
        
        return sessionDate >= targetDate && sessionDate < targetNextDay;
    });

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
        { label: t('dashboard.totalSessions'), value: totalSessions, icon: CalendarIcon, color: 'text-primary' },
        { label: t('dashboard.weeklyStats'), value: weeklyCompleted, icon: TrendingUp, color: 'text-green-400' },
        { label: t('sessions.status.noShow'), value: weeklyNoShow, icon: Clock, color: 'text-red-400' },
    ];

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm(t('common.confirmDelete'))) return;
        try {
            await sessionsApi.delete(sessionId);
            fetchSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const renderSessionCard = (session: typeof sessions[0]) => {
        const scheduledDate = new Date(session.scheduled_at);
        const timeStr = scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = scheduledDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

        return (
            <Card key={session.id}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[60px]">
                            <p className="text-xl font-bold text-white">{timeStr}</p>
                            <p className="text-xs text-gray-500">{dateStr}</p>
                        </div>
                        <div className="w-px h-12 bg-dark-100" />
                        <div className="flex-1">
                            <p className="text-white font-medium">
                                {session.client ? `${session.client.first_name} ${session.client.last_name}` : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-400">{session.duration_minutes} min</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                session.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                                    session.status === 'no_show' ? 'bg-red-500/20 text-red-400' :
                                        'bg-blue-500/20 text-blue-400'
                            }`}>
                            {t(`sessions.status.${session.status}`)}
                        </span>
                    </div>
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={() => navigate('/sessions')}
                            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-dark-200 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-dark-200 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Card>
        );
    };

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

            {/* Calendar & Selected Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold text-white mb-4">{t('sessions.calendar')}</h2>
                    <SessionCalendar 
                        sessions={sessions}
                        onDateSelect={setSelectedDate}
                    />
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                    </h2>
                    {selectedDateSessions.length === 0 ? (
                        <Card className="p-6 text-center">
                            <p className="text-gray-400">{t('sessions.noSessions')}</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateSessions.map(renderSessionCard)}
                        </div>
                    )}
                </div>
            </div>

            {/* All Future Sessions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">{t('dashboard.upcomingSessions')}</h2>
                    <button 
                        onClick={() => navigate('/sessions')}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        {t('common.viewAll')}
                    </button>
                </div>
                {allFutureSessions.length === 0 ? (
                    <Card className="p-6 text-center">
                        <p className="text-gray-400">{t('dashboard.noUpcoming')}</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {allFutureSessions.map(renderSessionCard)}
                    </div>
                )}
            </div>
        </div>
    );
}
