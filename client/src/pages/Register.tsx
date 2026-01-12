import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();
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
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="w-10 h-10 text-dark" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">PT Mate</h1>
                    <p className="text-gray-400 mt-2">Create your trainer account</p>
                </div>

                {/* Register Form */}
                <div className="bg-dark-300 rounded-2xl p-6 border border-dark-100">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="First name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="pl-12"
                                    required
                                />
                            </div>
                            <Input
                                type="text"
                                placeholder="Last name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input
                                type="email"
                                placeholder="Email"
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
                                placeholder="Password (min 6 characters)"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-12"
                                minLength={6}
                                required
                            />
                        </div>

                        <Input
                            type="password"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            error={!passwordsMatch ? 'Passwords do not match' : undefined}
                            required
                        />

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={!passwordsMatch}
                            className="w-full"
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary-400 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
