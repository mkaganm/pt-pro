import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import type { Assessment, CreateAssessmentRequest } from '../../types';

interface AssessmentFormProps {
    assessment?: Assessment | null;
    onSave: (data: CreateAssessmentRequest) => Promise<void>;
    isLoading?: boolean;
}

const defaultAssessment: CreateAssessmentRequest = {
    parq_heart_problem: false,
    parq_chest_pain: false,
    parq_dizziness: false,
    parq_chronic_condition: false,
    parq_medication: false,
    parq_bone_joint: false,
    parq_supervision: false,
    posture_head_neck: 2,
    posture_shoulders: 2,
    posture_lphc: 2,
    posture_knee: 2,
    posture_foot: 2,
    pushup_form: 2,
    pushup_scapular: 2,
    pushup_lordosis: 2,
    pushup_head_pos: 2,
    squat_feet_out: 2,
    squat_knees_in: 2,
    squat_lower_back: 2,
    squat_arms_forward: 2,
    squat_lean_forward: 2,
    balance_correct: 2,
    balance_knee_in: 2,
    balance_hip_rise: 2,
    shoulder_retraction: 2,
    shoulder_protraction: 2,
    shoulder_elevation: 2,
    shoulder_depression: 2,
    notes: '',
};

const parqQuestions = [
    { key: 'parq_heart_problem', label: 'Doktorunuz kalbinizde bir sorun olduğunu söyledi mi veya yüksek tansiyonunuz var mı?' },
    { key: 'parq_chest_pain', label: 'Dinlenirken veya egzersiz sırasında göğsünüzde ağrı hisseder misiniz?' },
    { key: 'parq_dizziness', label: 'Baş dönmesine bağlı denge kaybı veya son 12 ayda bilinç kaybı yaşadınız mı?' },
    { key: 'parq_chronic_condition', label: 'Diğer bir kronik durum tanısı aldınız mı?' },
    { key: 'parq_medication', label: 'Kronik bir durum için ilaç kullanıyor musunuz?' },
    { key: 'parq_bone_joint', label: 'Hareket kabiliyetinizi etkileyen kemik, eklem veya doku probleminiz var mı?' },
    { key: 'parq_supervision', label: 'Doktorunuz aktiviteyi sadece gözetim altında yapabileceğinizi söyledi mi?' },
];

const postureItems = [
    { key: 'posture_head_neck', label: 'Baş ve Boyun' },
    { key: 'posture_shoulders', label: 'Omuzlar ve Torasik Omurga' },
    { key: 'posture_lphc', label: 'Lumbo-Pelvik-Kalça Kompleksi' },
    { key: 'posture_knee', label: 'Diz' },
    { key: 'posture_foot', label: 'Ayak ve Ayak Bileği' },
];

const pushupItems = [
    { key: 'pushup_form', label: 'Doğru Form' },
    { key: 'pushup_scapular', label: 'Skapular kanatlaşma' },
    { key: 'pushup_lordosis', label: 'Aşırı lordoz' },
    { key: 'pushup_head_pos', label: 'Baş pozisyonu' },
];

const squatItems = [
    { key: 'squat_feet_out', label: 'Ayaklar dışa dönük' },
    { key: 'squat_knees_in', label: 'Dizler içe dönük' },
    { key: 'squat_lower_back', label: 'Bel kavisi' },
    { key: 'squat_arms_forward', label: 'Kollar düşük' },
    { key: 'squat_lean_forward', label: 'Fazla öne eğilme' },
];

const balanceItems = [
    { key: 'balance_correct', label: 'Doğru' },
    { key: 'balance_knee_in', label: 'Diz içe dönüyor' },
    { key: 'balance_hip_rise', label: 'Kalça yükselmesi' },
];

const shoulderItems = [
    { key: 'shoulder_retraction', label: 'Retraction (Geri çekilme)' },
    { key: 'shoulder_protraction', label: 'Protraction (Öne uzanma)' },
    { key: 'shoulder_elevation', label: 'Elevation (Yükselme)' },
    { key: 'shoulder_depression', label: 'Depression (Alçalma)' },
];

export default function AssessmentForm({ assessment, onSave, isLoading }: AssessmentFormProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<CreateAssessmentRequest>(defaultAssessment);

    useEffect(() => {
        if (assessment) {
            setFormData({
                parq_heart_problem: assessment.parq_heart_problem,
                parq_chest_pain: assessment.parq_chest_pain,
                parq_dizziness: assessment.parq_dizziness,
                parq_chronic_condition: assessment.parq_chronic_condition,
                parq_medication: assessment.parq_medication,
                parq_bone_joint: assessment.parq_bone_joint,
                parq_supervision: assessment.parq_supervision,
                posture_head_neck: assessment.posture_head_neck,
                posture_shoulders: assessment.posture_shoulders,
                posture_lphc: assessment.posture_lphc,
                posture_knee: assessment.posture_knee,
                posture_foot: assessment.posture_foot,
                pushup_form: assessment.pushup_form,
                pushup_scapular: assessment.pushup_scapular,
                pushup_lordosis: assessment.pushup_lordosis,
                pushup_head_pos: assessment.pushup_head_pos,
                squat_feet_out: assessment.squat_feet_out,
                squat_knees_in: assessment.squat_knees_in,
                squat_lower_back: assessment.squat_lower_back,
                squat_arms_forward: assessment.squat_arms_forward,
                squat_lean_forward: assessment.squat_lean_forward,
                balance_correct: assessment.balance_correct,
                balance_knee_in: assessment.balance_knee_in,
                balance_hip_rise: assessment.balance_hip_rise,
                shoulder_retraction: assessment.shoulder_retraction,
                shoulder_protraction: assessment.shoulder_protraction,
                shoulder_elevation: assessment.shoulder_elevation,
                shoulder_depression: assessment.shoulder_depression,
                notes: assessment.notes || '',
            });
        }
    }, [assessment]);

    const handleParqChange = (key: string, value: boolean) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleScoreChange = (key: string, value: number) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    const calculatePostureScore = () => {
        return formData.posture_head_neck + formData.posture_shoulders +
            formData.posture_lphc + formData.posture_knee + formData.posture_foot;
    };

    const getScoreLevel = (score: number) => {
        if (score <= 6) return { label: 'Kötü', color: 'text-red-400', bg: 'bg-red-500/20' };
        if (score <= 12) return { label: 'Orta', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { label: 'İyi', color: 'text-green-400', bg: 'bg-green-500/20' };
    };

    const parqHasYes = Object.keys(formData).filter(k => k.startsWith('parq_')).some(k => formData[k as keyof CreateAssessmentRequest] === true);
    const postureScore = calculatePostureScore();
    const scoreLevel = getScoreLevel(postureScore);

    const ScoreButton = ({ itemKey, value, currentValue }: { itemKey: string; value: number; currentValue: number }) => {
        const labels = ['', 'Kötü', 'Orta', 'İyi'];
        const colors = ['', 'bg-red-500/30 border-red-500', 'bg-yellow-500/30 border-yellow-500', 'bg-green-500/30 border-green-500'];
        const isSelected = currentValue === value;

        return (
            <button
                type="button"
                onClick={() => handleScoreChange(itemKey, value)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${isSelected
                        ? colors[value] + ' text-white'
                        : 'bg-dark-200 border-dark-100 text-gray-400 hover:border-gray-500'
                    }`}
            >
                {labels[value]}
            </button>
        );
    };

    const ScoreRow = ({ items, category }: { items: { key: string; label: string }[]; category: string }) => (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.key} className="flex items-center gap-4">
                    <span className="flex-1 text-sm text-gray-300">{item.label}</span>
                    <div className="flex gap-2 w-48">
                        <ScoreButton itemKey={item.key} value={1} currentValue={formData[item.key as keyof CreateAssessmentRequest] as number} />
                        <ScoreButton itemKey={item.key} value={2} currentValue={formData[item.key as keyof CreateAssessmentRequest] as number} />
                        <ScoreButton itemKey={item.key} value={3} currentValue={formData[item.key as keyof CreateAssessmentRequest] as number} />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* PARQ Test */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">1. PARQ Test</h3>
                        {parqHasYes && (
                            <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                Dikkat Gerektiriyor
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">Fiziksel Aktivite Hazır Oluşluk Anketi</p>

                    <div className="space-y-3">
                        {parqQuestions.map((q, idx) => (
                            <div key={q.key} className="flex items-start gap-4 p-3 bg-dark-200 rounded-lg">
                                <span className="text-gray-500 text-sm mt-1">{idx + 1}.</span>
                                <p className="flex-1 text-sm text-gray-300">{q.label}</p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleParqChange(q.key, true)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${formData[q.key as keyof CreateAssessmentRequest] === true
                                                ? 'bg-red-500/30 text-red-400 border border-red-500'
                                                : 'bg-dark-100 text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Evet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleParqChange(q.key, false)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${formData[q.key as keyof CreateAssessmentRequest] === false
                                                ? 'bg-green-500/30 text-green-400 border border-green-500'
                                                : 'bg-dark-100 text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        Hayır
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Posture Analysis */}
            <Card>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">2. Postür Analizi</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${scoreLevel.bg} ${scoreLevel.color}`}>
                            {postureScore} Puan - {scoreLevel.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">Kötü (1) | Orta (2) | İyi (3)</p>
                    <ScoreRow items={postureItems} category="posture" />
                </div>
            </Card>

            {/* Movement Tests */}
            <Card>
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">3. Hareket Testleri</h3>

                    {/* Push Up */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">Push Up / Core</h4>
                        <ScoreRow items={pushupItems} category="pushup" />
                    </div>

                    {/* Squat */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">Squat Test</h4>
                        <ScoreRow items={squatItems} category="squat" />
                    </div>

                    {/* Balance */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">Single Leg Balance</h4>
                        <ScoreRow items={balanceItems} category="balance" />
                    </div>

                    {/* Shoulder */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">Omuz Mobilite</h4>
                        <ScoreRow items={shoulderItems} category="shoulder" />
                    </div>
                </div>
            </Card>

            {/* Notes */}
            <Card>
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Notlar</h3>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ek notlar..."
                        className="w-full px-4 py-3 bg-dark-200 border border-dark-100 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                        rows={3}
                    />
                </div>
            </Card>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Kaydediliyor...' : (assessment ? 'Güncelle' : 'Değerlendirmeyi Kaydet')}
            </Button>
        </form>
    );
}
