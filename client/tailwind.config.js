/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary accent - Crimson Red
                primary: {
                    DEFAULT: '#FF3B3B',
                    50: '#FFE5E5',
                    100: '#FFCCCC',
                    200: '#FF9999',
                    300: '#FF6666',
                    400: '#FF4D4D',
                    500: '#FF3B3B',
                    600: '#E62E2E',
                    700: '#CC2424',
                    800: '#991B1B',
                    900: '#661212',
                },
                // Dark mode backgrounds
                dark: {
                    DEFAULT: '#121212',
                    50: '#2A2A2A',
                    100: '#252525',
                    200: '#1F1F1F',
                    300: '#1A1A1A',
                    400: '#151515',
                    500: '#121212',
                    600: '#0D0D0D',
                    700: '#080808',
                    800: '#030303',
                    900: '#000000',
                },
                // Status colors
                status: {
                    scheduled: '#3B82F6',
                    completed: '#22C55E',
                    noshow: '#EF4444',
                    cancelled: '#6B7280',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
        },
    },
    plugins: [],
}
