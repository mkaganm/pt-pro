import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Phone,
    Mail,
    Package,
    Calendar,
    Plus,
    Trash2,
    Scale,
    Edit2,
    ClipboardCheck,
    Camera,
    Upload,
    X
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import TimePicker from '../components/common/TimePicker';
import SessionCard from '../components/sessions/SessionCard';
import AssessmentForm from '../components/assessment/AssessmentForm';
import { useClientStore } from '../store/useClientStore';
import { sessionsApi, clientsApi, measurementsApi, assessmentsApi, photoGroupsApi } from '../api/endpoints';
import type { Session, Measurement, CreateMeasurementRequest, Assessment, CreateAssessmentRequest, PhotoGroup } from '../types';

export default function ClientDetail() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedClient, fetchClient, deleteClient, isLoading } = useClientStore();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [isAssessmentFormOpen, setIsAssessmentFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'sessions' | 'measurements' | 'assessment' | 'photos'>('sessions');
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
    const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [isSavingAssessment, setIsSavingAssessment] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoNotes, setPhotoNotes] = useState('');
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const [sessionForm, setSessionForm] = useState({
        date: '',
        time: '',
        duration_minutes: 60,
        notes: '',
    });
    const [measurementForm, setMeasurementForm] = useState<CreateMeasurementRequest>({
        weight_kg: undefined,
        neck_cm: undefined,
        shoulder_cm: undefined,
        chest_cm: undefined,
        waist_cm: undefined,
        hip_cm: undefined,
        right_arm_cm: undefined,
        left_arm_cm: undefined,
        right_leg_cm: undefined,
        left_leg_cm: undefined,
    });

    useEffect(() => {
        if (id) {
            fetchClient(id);
            loadSessions();
            loadMeasurements();
            loadAssessments();
            loadPhotoGroups();
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

    const loadAssessments = async () => {
        try {
            const response = await clientsApi.getAssessments(id!);
            setAssessments(response.data);
        } catch (error) {
            console.error('Failed to load assessments:', error);
            setAssessments([]);
        }
    };

    const loadPhotoGroups = async () => {
        try {
            const response = await clientsApi.getPhotoGroups(id!);
            setPhotoGroups(response.data);
        } catch (error) {
            console.error('Failed to load photo groups:', error);
            setPhotoGroups([]);
        }
    };

    const handleUploadPhotos = async () => {
        if (selectedPhotos.length === 0) return;
        setIsUploadingPhotos(true);
        try {
            const formData = new FormData();
            selectedPhotos.forEach((file) => {
                formData.append('photos', file);
            });
            if (photoNotes) {
                formData.append('notes', photoNotes);
            }
            await clientsApi.uploadPhotos(id!, formData);
            loadPhotoGroups();
            setSelectedPhotos([]);
            setPhotoNotes('');
        } catch (error) {
            console.error('Failed to upload photos:', error);
        } finally {
            setIsUploadingPhotos(false);
        }
    };

    const handleDeletePhotoGroup = async (groupId: string) => {
        if (!window.confirm(t('common.confirmDelete'))) return;
        try {
            await photoGroupsApi.delete(groupId);
            loadPhotoGroups();
        } catch (error) {
            console.error('Failed to delete photo group:', error);
        }
    };

    const handleSaveAssessment = async (data: CreateAssessmentRequest) => {
        setIsSavingAssessment(true);
        try {
            if (selectedAssessment) {
                await assessmentsApi.update(selectedAssessment.id, data);
            } else {
                await clientsApi.createAssessment(id!, data);
            }
            loadAssessments();
            setIsAssessmentFormOpen(false);
            setSelectedAssessment(null);
        } catch (error) {
            console.error('Failed to save assessment:', error);
        } finally {
            setIsSavingAssessment(false);
        }
    };

    const handleEditAssessment = (assessment: Assessment) => {
        setSelectedAssessment(assessment);
        setIsAssessmentFormOpen(true);
    };

    const handleDeleteAssessment = async (assessmentId: string) => {
        if (!window.confirm(t('common.confirmDelete'))) return;
        try {
            await assessmentsApi.delete(assessmentId);
            loadAssessments();
        } catch (error) {
            console.error('Failed to delete assessment:', error);
        }
    };

    const handleNewAssessment = () => {
        setSelectedAssessment(null);
        setIsAssessmentFormOpen(true);
    };

    const calculatePostureScore = (a: Assessment) => {
        return a.posture_head_neck + a.posture_shoulders + a.posture_lphc + a.posture_knee + a.posture_foot;
    };

    const getScoreLevel = (score: number) => {
        if (score <= 6) return { labelKey: 'assessment.scoreBad', color: 'text-red-400', bg: 'bg-red-500/20' };
        if (score <= 12) return { labelKey: 'assessment.scoreMedium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { labelKey: 'assessment.scoreGood', color: 'text-green-400', bg: 'bg-green-500/20' };
    };

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionForm.date || !sessionForm.time) return;

        try {
            const scheduledAt = new Date(`${sessionForm.date}T${sessionForm.time}:00`).toISOString();
            await sessionsApi.create({
                client_id: id!,
                scheduled_at: scheduledAt,
                duration_minutes: sessionForm.duration_minutes,
                notes: sessionForm.notes,
            });
            setIsSessionModalOpen(false);
            setSessionForm({ date: '', time: '', duration_minutes: 60, notes: '' });
            loadSessions();
            fetchClient(id!);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleAddOrUpdateMeasurement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMeasurement) {
                // Update existing measurement
                await measurementsApi.update(editingMeasurement.id, {
                    ...measurementForm,
                    measured_at: editingMeasurement.measured_at,
                });
            } else {
                // Create new measurement
                await clientsApi.createMeasurement(id!, {
                    ...measurementForm,
                    measured_at: new Date().toISOString(),
                });
            }
            setIsMeasurementModalOpen(false);
            setEditingMeasurement(null);
            setMeasurementForm({
                weight_kg: undefined,
                neck_cm: undefined,
                shoulder_cm: undefined,
                chest_cm: undefined,
                waist_cm: undefined,
                hip_cm: undefined,
                right_arm_cm: undefined,
                left_arm_cm: undefined,
                right_leg_cm: undefined,
                left_leg_cm: undefined,
            });
            loadMeasurements();
        } catch (error) {
            console.error('Failed to save measurement:', error);
        }
    };

    const handleEditMeasurement = (measurement: Measurement) => {
        setEditingMeasurement(measurement);
        setMeasurementForm({
            weight_kg: measurement.weight_kg,
            neck_cm: measurement.neck_cm,
            shoulder_cm: measurement.shoulder_cm,
            chest_cm: measurement.chest_cm,
            waist_cm: measurement.waist_cm,
            hip_cm: measurement.hip_cm,
            right_arm_cm: measurement.right_arm_cm,
            left_arm_cm: measurement.left_arm_cm,
            right_leg_cm: measurement.right_leg_cm,
            left_leg_cm: measurement.left_leg_cm,
        });
        setIsMeasurementModalOpen(true);
    };

    const handleDeleteMeasurement = async (measurementId: string) => {
        if (window.confirm(t('common.confirm') + '?')) {
            try {
                await measurementsApi.delete(measurementId);
                loadMeasurements();
            } catch (error) {
                console.error('Failed to delete measurement:', error);
            }
        }
    };

    const handleOpenMeasurementModal = () => {
        setEditingMeasurement(null);
        setMeasurementForm({
            weight_kg: undefined,
            neck_cm: undefined,
            shoulder_cm: undefined,
            chest_cm: undefined,
            waist_cm: undefined,
            hip_cm: undefined,
            right_arm_cm: undefined,
            left_arm_cm: undefined,
            right_leg_cm: undefined,
            left_leg_cm: undefined,
        });
        setIsMeasurementModalOpen(true);
    };

    const handleDelete = async () => {
        if (window.confirm(t('common.confirm') + '?')) {
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
                                <span className="text-sm text-gray-400">{t('clients.packageSize')}</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                                {selectedClient.remaining_sessions} / {selectedClient.total_package_size}
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
                            <p className="text-xs text-gray-500">{t('clients.completedSessions')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{selectedClient.no_show_sessions}</p>
                            <p className="text-xs text-gray-500">{t('clients.noShowSessions')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-400">{selectedClient.cancelled_sessions}</p>
                            <p className="text-xs text-gray-500">{t('clients.cancelledSessions')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-400">{selectedClient.scheduled_sessions}</p>
                            <p className="text-xs text-gray-500">{t('clients.scheduledSessions')}</p>
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
                        {t('clients.sessions')}
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
                        {t('clients.measurements')}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('assessment')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'assessment'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" />
                        {t('clients.assessment')}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('photos')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'photos'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        {t('clients.photos')}
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
                        {t('clients.addSession')}
                    </Button>

                    {sessions.length === 0 ? (
                        <Card className="text-center py-8">
                            <p className="text-gray-400">{t('sessions.noSessions')}</p>
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
                        onClick={handleOpenMeasurementModal}
                    >
                        {t('clients.addMeasurement')}
                    </Button>

                    {measurements.length === 0 ? (
                        <Card className="text-center py-8">
                            <p className="text-gray-400">{t('common.noData')}</p>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {measurements.map((measurement) => (
                                <Card key={measurement.id}>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center border-b border-dark-100 pb-2">
                                            <p className="text-sm font-medium text-primary">
                                                {new Date(measurement.measured_at).toLocaleDateString('tr-TR')}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditMeasurement(measurement)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-dark-200 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMeasurement(measurement.id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-dark-200 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {measurement.weight_kg && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.weight')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.weight_kg}</p>
                                                </div>
                                            )}
                                            {measurement.neck_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.neck')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.neck_cm}</p>
                                                </div>
                                            )}
                                            {measurement.shoulder_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.shoulder')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.shoulder_cm}</p>
                                                </div>
                                            )}
                                            {measurement.chest_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.chest')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.chest_cm}</p>
                                                </div>
                                            )}
                                            {measurement.waist_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.waist')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.waist_cm}</p>
                                                </div>
                                            )}
                                            {measurement.hip_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.hip')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.hip_cm}</p>
                                                </div>
                                            )}
                                            {measurement.right_arm_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.rightArm')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.right_arm_cm}</p>
                                                </div>
                                            )}
                                            {measurement.left_arm_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.leftArm')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.left_arm_cm}</p>
                                                </div>
                                            )}
                                            {measurement.right_leg_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.rightLeg')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.right_leg_cm}</p>
                                                </div>
                                            )}
                                            {measurement.left_leg_cm && (
                                                <div>
                                                    <p className="text-xs text-gray-500">{t('measurements.leftLeg')}</p>
                                                    <p className="text-lg font-semibold text-white">{measurement.left_leg_cm}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'assessment' && (
                <div className="space-y-4">
                    {!isAssessmentFormOpen ? (
                        <>
                            <Button
                                icon={<Plus className="w-5 h-5" />}
                                onClick={handleNewAssessment}
                            >
                                {t('assessment.newAssessment')}
                            </Button>

                            {assessments.length === 0 ? (
                                <Card className="text-center py-8">
                                    <p className="text-gray-400">{t('assessment.noAssessments')}</p>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {assessments.map((assessment) => {
                                        const score = calculatePostureScore(assessment);
                                        const level = getScoreLevel(score);
                                        return (
                                            <Card key={assessment.id} className="hover:border-primary/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-lg ${level.bg} flex items-center justify-center`}>
                                                            <ClipboardCheck className={`w-6 h-6 ${level.color}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">
                                                                {new Date(assessment.created_at).toLocaleDateString('tr-TR', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className={`${level.color}`}>{t('assessment.postureScore')}: {score} {t('assessment.point')} - {t(level.labelKey)}</span>
                                                                {assessment.notes && (
                                                                    <span className="text-gray-500">• {assessment.notes.slice(0, 50)}{assessment.notes.length > 50 ? '...' : ''}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditAssessment(assessment)}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-colors"
                                                            title={t('common.edit')}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAssessment(assessment.id)}
                                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-200 rounded-lg transition-colors"
                                                            title={t('common.delete')}
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
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => { setIsAssessmentFormOpen(false); setSelectedAssessment(null); }}
                                icon={<ArrowLeft className="w-4 h-4" />}
                            >
                                {t('common.back')}
                            </Button>
                            <AssessmentForm
                                assessment={selectedAssessment}
                                onSave={handleSaveAssessment}
                                isLoading={isSavingAssessment}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
                <div className="space-y-4">
                    {/* Upload Section */}
                    <Card>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">{t('photos.uploadNew')}</h3>
                            <div className="flex flex-col gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []).slice(0, 5);
                                        setSelectedPhotos(files);
                                    }}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-dark-500 hover:file:bg-primary/80 cursor-pointer"
                                />
                                {selectedPhotos.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPhotos.map((file, idx) => (
                                            <div key={idx} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Input
                                    label={t('photos.noteLabel')}
                                    value={photoNotes}
                                    onChange={(e) => setPhotoNotes(e.target.value)}
                                    placeholder={t('photos.notePlaceholder')}
                                />
                                <Button
                                    onClick={handleUploadPhotos}
                                    disabled={selectedPhotos.length === 0 || isUploadingPhotos}
                                    icon={<Upload className="w-4 h-4" />}
                                >
                                    {isUploadingPhotos ? t('common.uploading') : `${selectedPhotos.length} ${t('photos.uploadButton')}`}
                                </Button>
                                <p className="text-xs text-gray-500">{t('photos.maxPhotos')}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Photo History */}
                    {photoGroups.length === 0 ? (
                        <Card className="text-center py-8">
                            <p className="text-gray-400">{t('photos.noPhotos')}</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {photoGroups.map((group) => (
                                <Card key={group.id}>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Camera className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {new Date(group.created_at).toLocaleDateString('tr-TR', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-gray-400">{group.photos.length} {t('photos.photoCount')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeletePhotoGroup(group.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-200 rounded-lg transition-colors"
                                                title={t('photos.deleteGroup')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {group.notes && (
                                            <p className="text-sm text-gray-400">{group.notes}</p>
                                        )}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {group.photos.map((photo) => (
                                                <a
                                                    key={photo.id}
                                                    href={photo.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                                                >
                                                    <img
                                                        src={photo.url}
                                                        alt={photo.file_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </a>
                                            ))}
                                        </div>
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
                title={t('clients.addSession')}
            >
                <form onSubmit={handleAddSession} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('sessions.date')}
                            type="date"
                            value={sessionForm.date}
                            onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
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
                                {sessionForm.time ? (
                                    <span className="text-primary font-semibold text-lg">{sessionForm.time}</span>
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
                        value={sessionForm.duration_minutes}
                        onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) })}
                    />
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsSessionModalOpen(false)} className="flex-1">
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" className="flex-1">
                            {t('common.add')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Measurement Modal */}
            <Modal
                isOpen={isMeasurementModalOpen}
                onClose={() => {
                    setIsMeasurementModalOpen(false);
                    setEditingMeasurement(null);
                }}
                title={editingMeasurement ? t('common.edit') : t('clients.addMeasurement')}
                size="lg"
            >
                <form onSubmit={handleAddOrUpdateMeasurement} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('measurements.weight')}
                            type="number"
                            step="0.01"
                            value={measurementForm.weight_kg || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, weight_kg: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label={t('measurements.neck')}
                            type="number"
                            step="0.1"
                            value={measurementForm.neck_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, neck_cm: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('measurements.shoulder')}
                            type="number"
                            step="0.1"
                            value={measurementForm.shoulder_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, shoulder_cm: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label={t('measurements.chest')}
                            type="number"
                            step="0.1"
                            value={measurementForm.chest_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, chest_cm: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('measurements.waist')}
                            type="number"
                            step="0.1"
                            value={measurementForm.waist_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, waist_cm: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label={t('measurements.hip')}
                            type="number"
                            step="0.1"
                            value={measurementForm.hip_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, hip_cm: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('measurements.rightArm')}
                            type="number"
                            step="0.1"
                            value={measurementForm.right_arm_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, right_arm_cm: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label={t('measurements.leftArm')}
                            type="number"
                            step="0.1"
                            value={measurementForm.left_arm_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, left_arm_cm: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('measurements.rightLeg')}
                            type="number"
                            step="0.1"
                            value={measurementForm.right_leg_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, right_leg_cm: parseFloat(e.target.value) || undefined })}
                        />
                        <Input
                            label={t('measurements.leftLeg')}
                            type="number"
                            step="0.1"
                            value={measurementForm.left_leg_cm || ''}
                            onChange={(e) => setMeasurementForm({ ...measurementForm, left_leg_cm: parseFloat(e.target.value) || undefined })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => {
                            setIsMeasurementModalOpen(false);
                            setEditingMeasurement(null);
                        }} className="flex-1">
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" className="flex-1">
                            {editingMeasurement ? t('common.save') : t('common.add')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Time Picker */}
            <TimePicker
                isOpen={isTimePickerOpen}
                onClose={() => setIsTimePickerOpen(false)}
                value={sessionForm.time}
                onChange={(time) => setSessionForm({ ...sessionForm, time })}
            />
        </div>
    );
}
