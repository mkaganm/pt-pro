import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (formData.password !== formData.confirmPassword) {
            return;
        }

        try {
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                terms_accepted: true,
            });
            navigate('/');
        } catch {
            // Error is handled by store
        }
    };

    const passwordsMatch = formData.password === formData.confirmPassword || formData.confirmPassword === '';

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Language Switcher */}
                <div className="flex justify-end mb-4">
                    <LanguageSwitcher />
                </div>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-10 h-10 text-dark" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">PT Mate</h1>
                    <p className="text-gray-400 mt-2">{t('auth.createAccount')}</p>
                </div>

                {/* Register Form */}
                <div className="bg-dark-300 rounded-2xl p-6 border border-dark-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error.startsWith('auth.') ? t(error) : error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder={t('auth.firstName')}
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="pl-12"
                                    required
                                />
                            </div>
                            <Input
                                type="text"
                                placeholder={t('auth.lastName')}
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input
                                type="email"
                                placeholder={t('auth.email')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-12"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input
                                type="password"
                                placeholder={t('auth.passwordMinLength')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-12"
                                minLength={6}
                                required
                            />
                        </div>

                        <Input
                            type="password"
                            placeholder={t('auth.confirmPassword')}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            error={!passwordsMatch ? t('auth.passwordsDoNotMatch') : undefined}
                            required
                        />

                        <div className="flex items-start gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-dark-200"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-400">
                                {t('auth.termsLabel')} <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-primary hover:underline">{t('auth.termsLink')}</button>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={!passwordsMatch}
                            className="w-full"
                        >
                            {t('auth.register')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            {t('auth.haveAccount')}{' '}
                            <Link to="/login" className="text-primary hover:text-primary-400 font-medium">
                                {t('auth.signIn')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                title={t('auth.termsModalTitle')}
            >
                <div className="text-gray-300 leading-relaxed space-y-4">
                    <p className="whitespace-pre-line text-[15px] leading-7">{t('auth.termsModalBody')}</p>
                </div>
                <div className="mt-6">
                    <Button onClick={() => setIsTermsModalOpen(false)} className="w-full">
                        {t('common.close')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
