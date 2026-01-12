import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Menu,
    X,
    Dumbbell,
    LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { trainer, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
        { path: '/clients', label: t('nav.clients'), icon: Users },
        { path: '/sessions', label: t('nav.sessions'), icon: Calendar },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-dark">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-dark-300 border-r border-dark-100">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-100">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-dark" />
                    </div>
                    <span className="text-xl font-bold text-white">PT Mate</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-400 hover:bg-dark-200 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User, Language & Logout */}
                <div className="px-4 py-4 border-t border-dark-100">
                    {trainer && (
                        <div className="flex items-center gap-3 px-4 py-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-primary text-sm font-semibold">
                                    {trainer.first_name.charAt(0)}{trainer.last_name.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {trainer.first_name} {trainer.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{trainer.email}</p>
                            </div>
                        </div>
                    )}
                    <LanguageSwitcher />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-400 hover:bg-dark-200 hover:text-white transition-all duration-200 mt-1"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('nav.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-dark-300 border-b border-dark-100">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-dark" />
                        </div>
                        <span className="text-lg font-bold text-white">PT Mate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-dark-200"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <nav className="px-4 py-4 space-y-1 bg-dark-300 border-t border-dark-100 animate-fade-in">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-400 hover:bg-dark-200 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-400 hover:bg-dark-200 hover:text-white transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">{t('nav.logout')}</span>
                        </button>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="md:pl-64 pt-16 md:pt-0 min-h-screen">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-dark-300 border-t border-dark-100 safe-area-inset-bottom">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 ${isActive ? 'text-primary' : 'text-gray-500'
                                    }`}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
