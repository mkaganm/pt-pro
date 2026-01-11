import { useEffect, useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import SessionCard from '../components/sessions/SessionCard';
import StatusBadge from '../components/common/StatusBadge';
import { useSessionStore } from '../store/useSessionStore';
import { useClientStore } from '../store/useClientStore';
import type { SessionStatus, CreateSessionRequest } from '../types';

export default function Sessions() {
    const { sessions, isLoading, fetchSessions, createSession, updateSessionStatus } = useSessionStore();
    const { clients, fetchClients } = useClientStore();
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateSessionRequest>({
        client_id: '',
        scheduled_at: '',
        duration_minutes: 60,
        notes: '',
    });

    useEffect(() => {
        fetchSessions();
        fetchClients();
    }, [fetchSessions, fetchClients]);

    const filteredSessions = sessions.filter((session) => {
        if (statusFilter === 'all') return true;
        return session.status === statusFilter;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSession({
                ...formData,
                scheduled_at: new Date(formData.scheduled_at).toISOString(),
            });
            setIsModalOpen(false);
            setFormData({
                client_id: '',
                scheduled_at: '',
                duration_minutes: 60,
                notes: '',
            });
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleStatusChange = async (sessionId: string, newStatus: SessionStatus) => {
        try {
            await updateSessionStatus(sessionId, newStatus);
            setSelectedSession(null);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const statuses: SessionStatus[] = ['scheduled', 'completed', 'no_show', 'cancelled'];

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sessions</h1>
                    <p className="text-gray-400 mt-1">{sessions.length} total sessions</p>
                </div>
                <Button icon={<Plus className="w-5 h-5" />} onClick={() => setIsModalOpen(true)}>
                    Add Session
                </Button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${statusFilter === 'all'
                            ? 'bg-primary text-dark'
                            : 'bg-dark-200 text-gray-400 hover:text-white'
                        }`}
                >
                    All
                </button>
                {statuses.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${statusFilter === status
                                ? 'bg-primary text-dark'
                                : 'bg-dark-200 text-gray-400 hover:text-white'
                            }`}
                    >
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </button>
                ))}
            </div>

            {/* Session List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredSessions.length === 0 ? (
                <Card className="text-center py-12">
                    <p className="text-gray-400">No sessions found</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onClick={() => setSelectedSession(session.id)}
                        />
                    ))}
                </div>
            )}

            {/* Add Session Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Session"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Client</label>
                        <select
                            value={formData.client_id}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="">Select a client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.first_name} {client.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Date & Time"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        required
                    />
                    <Input
                        label="Duration (minutes)"
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Session
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Update Status Modal */}
            <Modal
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
                title="Update Session Status"
                size="sm"
            >
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-4">Select the new status for this session:</p>
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(selectedSession!, status)}
                            className="w-full flex items-center justify-between p-4 bg-dark-200 hover:bg-dark-100 rounded-lg transition-colors"
                        >
                            <StatusBadge status={status} />
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
