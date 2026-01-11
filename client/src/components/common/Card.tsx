import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export default function Card({ children, className = '', onClick, hover = false }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-dark-300 rounded-xl p-4 border border-dark-100 ${hover ? 'hover:border-dark-50 transition-colors duration-200 cursor-pointer' : ''
                } ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
