import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Phone,
    Mail,
    Package,
    Calendar,
    Plus,
    Trash2,
    Scale
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import SessionCard from '../components/sessions/SessionCard';
import { useClientStore } from '../store/useClientStore';
import { sessionsApi, clientsApi } from '../api/endpoints';
import type { Session, Measurement, CreateMeasurementRequest } from '../types';

export default function ClientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedClient, fetchClient, deleteClient, isLoading } = useClientStore();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [activeTab, setActiveTab] = useState<'sessions' | 'measurements'>('sessions');
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
    const [sessionForm, setSessionForm] = useState({
        scheduled_at: '',
        duration_minutes: 60,
        notes: '',
    });
    const [measurementForm, setMeasurementForm] = useState<CreateMeasurementRequest>({
        weight_kg: undefined,
        height_cm: undefined,
        body_fat_percent: undefined,
        waist_cm: undefined,
        hip_cm: undefined,
    });

    useEffect(() => {
        if (id) {
            fetchClient(id);
            loadSessions();
            loadMeasurements();
        }
    }, [id, fetchClient]);

    const loadSessions = async () => {
        try {
            const response = await sessionsApi.getAll({ client_id: id });
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const loadMeasurements = async () => {
        try {
            const response = await clientsApi.getMeasurements(id!);
            setMeasurements(response.data);
        } catch (error) {
            console.error('Failed to load measurements:', error);
        }
    };

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sessionsApi.create({
                client_id: id!,
                scheduled_at: new Date(sessionForm.scheduled_at).toISOString(),
                duration_minutes: sessionForm.duration_minutes,
                notes: sessionForm.notes,
            });
            setIsSessionModalOpen(false);
            setSessionForm({ scheduled_at: '', duration_minutes: 60, notes: '' });
            loadSessions();
            fetchClient(id!);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleAddMeasurement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await clientsApi.createMeasurement(id!, {
                ...measurementForm,
                measured_at: new Date().toISOString(),
            });
            setIsMeasurementModalOpen(false);
            setMeasurementForm({});
            loadMeasurements();
        } catch (error) {
            console.error('Failed to create measurement:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await deleteClient(id!);
                navigate('/clients');
            } catch (error) {
                console.error('Failed to delete client:', error);
            }
        }
    };

    if (isLoading || !selectedClient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const remainingPercentage = selectedClient.total_package_size > 0
        ? (selectedClient.remaining_sessions / selectedClient.total_package_size) * 100
        : 0;

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/clients')}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-200 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">
                        {selectedClient.first_name} {selectedClient.last_name}
                    </h1>
                </div>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Client Info Card */}
            <Card>
                <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4">
                        {selectedClient.phone && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span>{selectedClient.phone}</span>
                            </div>
                        )}
                        {selectedClient.email && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Mail className="w-4 h-4" />
                                <span>{selectedClient.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Package Progress */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                <span className="text-sm text-gray-400">Package Progress</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                                {selectedClient.remaining_sessions} / {selectedClient.total_package_size} remaining
                            </span>
                        </div>
                        <div className="w-full h-3 bg-dark-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${remainingPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-dark-100">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{selectedClient.completed_sessions}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{selectedClient.no_show_sessions}</p>
                            <p className="text-xs text-gray-500">No-Shows</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-400">{selectedClient.cancelled_sessions}</p>
                            <p className="text-xs text-gray-500">Cancelled</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{selectedClient.scheduled_sessions}</p>
                            <p className="text-xs text-gray-500">Scheduled</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-dark-100">
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'sessions'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Sessions
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('measurements')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'measurements'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Measurements
                    </div>
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'sessions' && (
                <div className="space-y-4">
                    <Button
                        icon={<Plus className="w-5 h-5" />}
                        onClick={() => setIsSessionModalOpen(true)}
                    >
                        Add Session
                    </Button>

                    {sessions.length === 0 ? (
                        <Card className="text-center py-8">
                            <p className="text-gray-400">No sessions yet</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <SessionCard key={session.id} session={session} showClient={false} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'measurements' && (
                <div className="space-y-4">
                    <Button
                        icon={<Plus className="w-5 h-5" />}
                        onClick={() => setIsMeasurementModalOpen(true)}
                    >
                        Add Measurement
                    </Button>

                    {measurements.length === 0 ? (
                        <Card className="text-center py-8">
                            <p className="text-gray-400">No measurements yet</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {measurements.map((measurement) => (
                                <Card key={measurement.id}>
                                    <div className="flex justify-between items-start">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {measurement.weight_kg && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Weight</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.weight_kg} kg</p>
                                                </div>
                                            )}
                                            {measurement.body_fat_percent && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Body Fat</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.body_fat_percent}%</p>
                                                </div>
                                            )}
                                            {measurement.waist_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Waist</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.waist_cm} cm</p>
                                                </div>
                                            )}
                                            {measurement.hip_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Hip</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.hip_cm} cm</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(measurement.measured_at).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Session Modal */}
            <Modal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                title="Add Session"
            >
                <form onSubmit={handleAddSession} className="space-y-4">
                    <Input
                        label="Date & Time"
                        type="datetime-local"
                        value={sessionForm.scheduled_at}
                        onChange={(e) => setSessionForm({ ...sessionForm, scheduled_at: e.target.value })}
                        required
                    />
                    <Input
                        label="Duration (minutes)"
                        type="number"
                        min="15"
                        step="15"
                        value={sessionForm.duration_minutes}
                        onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsSessionModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Session
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add Measurement Modal */}
            <Modal
                isOpen={isMeasurementModalOpen}
                onClose={() => setIsMeasurementModalOpen(false)}
                title="Add Measurement"
            >
                <form onSubmit={handleAddMeasurement} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Weight (kg)"
                            type="number"
                            step="0.1"
                            value={measurementForm.weight_kg || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, weight_kg: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label="Body Fat (%)"
                            type="number"
                            step="0.1"
                            value={measurementForm.body_fat_percent || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, body_fat_percent: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Waist (cm)"
                            type="number"
                            step="0.1"
                            value={measurementForm.waist_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, waist_cm: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label="Hip (cm)"
                            type="number"
                            step="0.1"
                            value={measurementForm.hip_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, hip_cm: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsMeasurementModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Measurement
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
