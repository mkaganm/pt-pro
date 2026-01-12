import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import SessionCard from '../components/sessions/SessionCard';
import StatusBadge from '../components/common/StatusBadge';
import { useSessionStore } from '../store/useSessionStore';
import { useClientStore } from '../store/useClientStore';
import type { CreateSessionRequest, SessionStatus } from '../types';

export default function Sessions() {
    const { t } = useTranslation();
    const { sessions, isLoading, fetchSessions, createSession, updateSessionStatus } = useSessionStore();
    const { clients, fetchClients } = useClientStore();
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
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

    const statusOptions: (SessionStatus | 'all')[] = ['all', 'scheduled', 'completed', 'no_show', 'cancelled'];

    const filteredSessions = statusFilter === 'all'
        ? sessions
        : sessions.filter((s) => s.status === statusFilter);

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSession(formData);
            setIsAddModalOpen(false);
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

    const handleStatusUpdate = async (status: SessionStatus) => {
        if (!selectedSessionId) return;
        try {
            await updateSessionStatus(selectedSessionId, status);
            setIsStatusModalOpen(false);
            setSelectedSessionId(null);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const openStatusModal = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setIsStatusModalOpen(true);
    };

    const getStatusLabel = (status: SessionStatus | 'all') => {
        if (status === 'all') return t('sessions.allStatuses');
        return t(`sessions.${status}`);
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('sessions.title')}</h1>
                    <p className="text-gray-400 mt-1">
                        {filteredSessions.length} {statusFilter === 'all' ? t('sessions.title').toLowerCase() : getStatusLabel(statusFilter).toLowerCase()}
                    </p>
                </div>
                <Button icon={<Plus className="w-5 h-5" />} onClick={() => setIsAddModalOpen(true)}>
                    {t('sessions.addSession')}
                </Button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {statusOptions.map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                                ? 'bg-primary text-dark'
                                : 'bg-dark-300 text-gray-400 hover:text-white'
                            }`}
                    >
                        {getStatusLabel(status)}
                    </button>
                ))}
            </div>

            {/* Session List */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                        {statusFilter === 'all' ? t('sessions.noSessions') : t('sessions.noResults')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSessions.map((session) => (
                        <div key={session.id} onClick={() => openStatusModal(session.id)}>
                            <SessionCard session={session} />
                        </div>
                    ))}
                </div>
            )}

            {/* Add Session Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={t('sessions.addSession')}
                size="md"
            >
                <form onSubmit={handleAddSession} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('sessions.selectClient')}
                        </label>
                        <select
                            value={formData.client_id}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                            className="w-full px-4 py-3 bg-dark-200 border border-dark-100 rounded-lg text-white focus:outline-none focus:border-primary"
                            required
                        >
                            <option value="">{t('sessions.selectClient')}</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.first_name} {client.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label={t('sessions.dateTime')}
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        required
                    />
                    <Input
                        label={t('sessions.duration')}
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                    />
                    <Input
                        label={t('sessions.notes')}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" className="flex-1">
                            {t('sessions.addSession')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Update Status Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title={t('sessions.updateStatus')}
                size="sm"
            >
                <div className="space-y-3">
                    {(['scheduled', 'completed', 'no_show', 'cancelled'] as SessionStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusUpdate(status)}
                            className="w-full p-4 bg-dark-200 hover:bg-dark-100 rounded-lg transition-all flex items-center justify-between"
                        >
                            <span className="text-white font-medium">{getStatusLabel(status)}</span>
                            <StatusBadge status={status} />
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
