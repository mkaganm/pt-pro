import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, Edit2, Trash2, Clock, User } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import TimePicker from '../components/common/TimePicker';
// SessionCard removed - using inline cards with edit/delete buttons
import StatusBadge from '../components/common/StatusBadge';
import { useSessionStore } from '../store/useSessionStore';
import { useClientStore } from '../store/useClientStore';
import type { Session, SessionStatus } from '../types';
import { sessionsApi } from '../api/endpoints';
import Card from '../components/common/Card';

export default function Sessions() {
    const { t } = useTranslation();
    const { sessions, isLoading, fetchSessions, createSession, updateSessionStatus } = useSessionStore();
    const { clients, fetchClients } = useClientStore();
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [editingSession, setEditingSession] = useState<Session | null>(null);

    // Separate date and time states
    const [formData, setFormData] = useState({
        client_id: '',
        date: '',
        time: '',
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

    const handleEditSession = (session: Session) => {
        const scheduledDate = new Date(session.scheduled_at);
        const dateStr = scheduledDate.toISOString().split('T')[0];
        const timeStr = scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        setFormData({
            client_id: session.client_id,
            date: dateStr,
            time: timeStr,
            duration_minutes: session.duration_minutes,
            notes: session.notes || '',
        });
        setEditingSession(session);
        setIsAddModalOpen(true);
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm(t('common.confirmDelete'))) return;
        try {
            await sessionsApi.delete(sessionId);
            fetchSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const handleAddOrUpdateSession = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.date || !formData.time) {
            return;
        }

        try {
            const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();

            if (editingSession) {
                await sessionsApi.update(editingSession.id, {
                    scheduled_at: scheduledAt,
                    duration_minutes: formData.duration_minutes,
                    notes: formData.notes,
                });
            } else {
                await createSession({
                    client_id: formData.client_id,
                    scheduled_at: scheduledAt,
                    duration_minutes: formData.duration_minutes,
                    notes: formData.notes,
                });
            }
            setIsAddModalOpen(false);
            setEditingSession(null);
            setFormData({
                client_id: '',
                date: '',
                time: '',
                duration_minutes: 60,
                notes: '',
            });
            fetchSessions();
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    };

    const getStatusLabel = (status: SessionStatus | 'all') => {
        if (status === 'all') return t('sessions.allStatuses');
        // Map status to translation key (no_show -> noShow)
        const keyMap: Record<string, string> = {
            scheduled: 'scheduled',
            completed: 'completed',
            no_show: 'noShow',
            cancelled: 'cancelled',
        };
        return t(`sessions.${keyMap[status] || status}`);
    };

    // Set default date to today when modal opens
    const handleOpenModal = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({ ...formData, date: today, time: '10:00' });
        setIsAddModalOpen(true);
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
                <Button icon={<Plus className="w-5 h-5" />} onClick={handleOpenModal}>
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
                    {filteredSessions.map((session) => {
                        const scheduledDate = new Date(session.scheduled_at);
                        const timeStr = scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                        const dateStr = scheduledDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

                        return (
                            <Card key={session.id}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => openStatusModal(session.id)}>
                                        <div className="text-center min-w-[60px]">
                                            <p className="text-xl font-bold text-white">{timeStr}</p>
                                            <p className="text-xs text-gray-500">{dateStr}</p>
                                        </div>
                                        <div className="w-px h-12 bg-dark-100" />
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-white">{session.client ? `${session.client.first_name} ${session.client.last_name}` : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-400">{session.duration_minutes} min</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            session.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                                                session.status === 'no_show' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {t(`sessions.status.${session.status}`)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditSession(session); }}
                                            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-dark-200 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-dark-200 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Session Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingSession(null);
                    setFormData({ client_id: '', date: '', time: '', duration_minutes: 60, notes: '' });
                }}
                title={editingSession ? t('sessions.editSession') : t('sessions.addSession')}
                size="md"
            >
                <form onSubmit={handleAddOrUpdateSession} className="space-y-4">
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

                    {/* Separate Date and Time - with styled dropdown for time */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('sessions.date')}
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('sessions.time')}
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsTimePickerOpen(true)}
                                className="w-full px-4 py-3 bg-dark-200 border border-dark-100 rounded-lg text-left focus:outline-none focus:border-primary transition-colors"
                            >
                                {formData.time ? (
                                    <span className="text-primary font-semibold text-lg">{formData.time}</span>
                                ) : (
                                    <span className="text-gray-500">{t('sessions.selectTime')}</span>
                                )}
                            </button>
                        </div>
                    </div>

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

            {/* Time Picker */}
            <TimePicker
                isOpen={isTimePickerOpen}
                onClose={() => setIsTimePickerOpen(false)}
                value={formData.time}
                onChange={(time) => setFormData({ ...formData, time })}
            />
        </div>
    );
}
