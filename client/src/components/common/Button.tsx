import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-primary text-dark hover:bg-primary-400 active:bg-primary-600 focus:ring-primary',
        secondary: 'bg-dark-100 text-white hover:bg-dark-50 active:bg-dark-200 border border-dark-50 focus:ring-dark-50',
        danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus:ring-red-500',
        ghost: 'text-gray-400 hover:text-white hover:bg-dark-200 focus:ring-dark-50',
    };

    const sizeStyles = {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        md: 'px-4 py-3 text-sm min-h-[48px]',
        lg: 'px-6 py-4 text-base min-h-[56px]',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : icon ? (
                <span className="mr-2">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}
