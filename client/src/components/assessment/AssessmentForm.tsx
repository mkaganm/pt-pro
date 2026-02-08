import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
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

export default function AssessmentForm({ assessment, onSave, isLoading }: AssessmentFormProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<CreateAssessmentRequest>(defaultAssessment);

    const parqQuestions = [
        { key: 'parq_heart_problem', labelKey: 'assessment.parqHeartProblem' },
        { key: 'parq_chest_pain', labelKey: 'assessment.parqChestPain' },
        { key: 'parq_dizziness', labelKey: 'assessment.parqDizziness' },
        { key: 'parq_chronic_condition', labelKey: 'assessment.parqChronicCondition' },
        { key: 'parq_medication', labelKey: 'assessment.parqMedication' },
        { key: 'parq_bone_joint', labelKey: 'assessment.parqBoneJoint' },
        { key: 'parq_supervision', labelKey: 'assessment.parqSupervision' },
    ];

    const postureItems = [
        { key: 'posture_head_neck', labelKey: 'assessment.postureHeadNeck' },
        { key: 'posture_shoulders', labelKey: 'assessment.postureShoulders' },
        { key: 'posture_lphc', labelKey: 'assessment.postureLphc' },
        { key: 'posture_knee', labelKey: 'assessment.postureKnee' },
        { key: 'posture_foot', labelKey: 'assessment.postureFoot' },
    ];

    const pushupItems = [
        { key: 'pushup_form', labelKey: 'assessment.pushupForm' },
        { key: 'pushup_scapular', labelKey: 'assessment.pushupScapular' },
        { key: 'pushup_lordosis', labelKey: 'assessment.pushupLordosis' },
        { key: 'pushup_head_pos', labelKey: 'assessment.pushupHeadPos' },
    ];

    const squatItems = [
        { key: 'squat_feet_out', labelKey: 'assessment.squatFeetOut' },
        { key: 'squat_knees_in', labelKey: 'assessment.squatKneesIn' },
        { key: 'squat_lower_back', labelKey: 'assessment.squatLowerBack' },
        { key: 'squat_arms_forward', labelKey: 'assessment.squatArmsForward' },
        { key: 'squat_lean_forward', labelKey: 'assessment.squatLeanForward' },
    ];

    const balanceItems = [
        { key: 'balance_correct', labelKey: 'assessment.balanceCorrect' },
        { key: 'balance_knee_in', labelKey: 'assessment.balanceKneeIn' },
        { key: 'balance_hip_rise', labelKey: 'assessment.balanceHipRise' },
    ];

    const shoulderItems = [
        { key: 'shoulder_retraction', labelKey: 'assessment.shoulderRetraction' },
        { key: 'shoulder_protraction', labelKey: 'assessment.shoulderProtraction' },
        { key: 'shoulder_elevation', labelKey: 'assessment.shoulderElevation' },
        { key: 'shoulder_depression', labelKey: 'assessment.shoulderDepression' },
    ];

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
        if (score <= 6) return { labelKey: 'assessment.scoreBad', color: 'text-red-400', bg: 'bg-red-500/20' };
        if (score <= 12) return { labelKey: 'assessment.scoreMedium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { labelKey: 'assessment.scoreGood', color: 'text-green-400', bg: 'bg-green-500/20' };
    };

    const parqHasYes = Object.keys(formData).filter(k => k.startsWith('parq_')).some(k => formData[k as keyof CreateAssessmentRequest] === true);
    const postureScore = calculatePostureScore();
    const scoreLevel = getScoreLevel(postureScore);

    const ScoreButton = ({ itemKey, value, currentValue }: { itemKey: string; value: number; currentValue: number }) => {
        const labels = ['', t('assessment.scoreBad'), t('assessment.scoreMedium'), t('assessment.scoreGood')];
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

    const ScoreRow = ({ items }: { items: { key: string; labelKey: string }[] }) => (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.key} className="flex items-center gap-4">
                    <span className="flex-1 text-sm text-gray-300">{t(item.labelKey)}</span>
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
                        <h3 className="text-lg font-semibold text-white">1. {t('assessment.parqTitle')}</h3>
                        {parqHasYes && (
                            <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                {t('assessment.parqWarning')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">{t('assessment.parqDescription')}</p>

                    <div className="space-y-3">
                        {parqQuestions.map((q, idx) => (
                            <div key={q.key} className="flex items-start gap-4 p-3 bg-dark-200 rounded-lg">
                                <span className="text-gray-500 text-sm mt-1">{idx + 1}.</span>
                                <p className="flex-1 text-sm text-gray-300">{t(q.labelKey)}</p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleParqChange(q.key, true)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${formData[q.key as keyof CreateAssessmentRequest] === true
                                            ? 'bg-red-500/30 text-red-400 border border-red-500'
                                            : 'bg-dark-100 text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {t('common.yes')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleParqChange(q.key, false)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${formData[q.key as keyof CreateAssessmentRequest] === false
                                            ? 'bg-green-500/30 text-green-400 border border-green-500'
                                            : 'bg-dark-100 text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {t('common.no')}
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
                        <h3 className="text-lg font-semibold text-white">2. {t('assessment.postureTitle')}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${scoreLevel.bg} ${scoreLevel.color}`}>
                            {postureScore} {t('assessment.point')} - {t(scoreLevel.labelKey)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">{t('assessment.postureDescription')}</p>
                    <ScoreRow items={postureItems} />
                </div>
            </Card>

            {/* Movement Tests */}
            <Card>
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">3. {t('assessment.movementTitle')}</h3>

                    {/* Push Up */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">{t('assessment.pushupTitle')}</h4>
                        <ScoreRow items={pushupItems} />
                    </div>

                    {/* Squat */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">{t('assessment.squatTitle')}</h4>
                        <ScoreRow items={squatItems} />
                    </div>

                    {/* Balance */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">{t('assessment.balanceTitle')}</h4>
                        <ScoreRow items={balanceItems} />
                    </div>

                    {/* Shoulder */}
                    <div>
                        <h4 className="text-md font-medium text-primary mb-3">{t('assessment.shoulderTitle')}</h4>
                        <ScoreRow items={shoulderItems} />
                    </div>
                </div>
            </Card>

            {/* Notes */}
            <Card>
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">{t('assessment.notesTitle')}</h3>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t('assessment.notesPlaceholder')}
                        className="w-full px-4 py-3 bg-dark-200 border border-dark-100 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                        rows={3}
                    />
                </div>
            </Card>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('common.saving') : (assessment ? t('common.update') : t('assessment.saveAssessment'))}
            </Button>
        </form>
    );
}
