import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 animate-fade-in backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full ${sizeClasses[size]} bg-dark-300 rounded-2xl border border-dark-100 shadow-2xl animate-slide-up flex flex-col max-h-[85vh]`}
            >
                {/* Header (Fixed) */}
                <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-dark-100 bg-dark-300 rounded-t-2xl z-10">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-6 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
