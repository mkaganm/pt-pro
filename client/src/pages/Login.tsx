import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch {
            // Error is handled by store
        }
    };

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
                    <p className="text-gray-400 mt-2">{t('auth.welcomeBack')}</p>
                </div>

                {/* Login Form */}
                <div className="bg-dark-300 rounded-2xl p-6 border border-dark-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error.startsWith('auth.') ? t(error) : error}</p>
                            </div>
                        )}

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
                                placeholder={t('auth.password')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-12"
                                required
                            />
                        </div>

                        <Button type="submit" isLoading={isLoading} className="w-full">
                            {t('auth.login')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            {t('auth.noAccount')}{' '}
                            <Link to="/register" className="text-primary hover:text-primary-400 font-medium">
                                {t('auth.signUp')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
