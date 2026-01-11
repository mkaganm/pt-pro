import { useEffect, useState } from 'react';
import { Users, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import Card from '../components/common/Card';
import SessionCard from '../components/sessions/SessionCard';
import { dashboardApi } from '../api/endpoints';
import type { DashboardData } from '../types';

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardApi.getData();
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center text-gray-400 py-12">
                Failed to load dashboard data
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Clients',
            value: data.total_clients,
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20',
        },
        {
            label: 'Weekly Completed',
            value: data.weekly_stats.completed,
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
        },
        {
            label: 'Weekly No-Shows',
            value: data.weekly_stats.no_show,
            icon: XCircle,
            color: 'text-red-400',
            bgColor: 'bg-red-500/20',
        },
        {
            label: 'Upcoming',
            value: data.weekly_stats.scheduled,
            icon: TrendingUp,
            color: 'text-primary',
            bgColor: 'bg-primary/20',
        },
    ];

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">Welcome back! Here's your overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex flex-col">
                        <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Today's Sessions */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-white">Today's Sessions</h2>
                </div>

                {data.today_sessions.length === 0 ? (
                    <Card className="text-center py-8">
                        <p className="text-gray-400">No sessions scheduled for today</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {data.today_sessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Sessions */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-white">Upcoming Sessions</h2>
                </div>

                {data.upcoming_sessions.length === 0 ? (
                    <Card className="text-center py-8">
                        <p className="text-gray-400">No upcoming sessions</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {data.upcoming_sessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
