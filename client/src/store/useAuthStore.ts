import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

interface Trainer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthStore {
    token: string | null;
    trainer: Trainer | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    checkAuth: () => Promise<void>;
}

interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            trainer: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { token, trainer } = response.data;

                    // Set token in axios default headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        token,
                        trainer,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.error || 'auth.loginFailed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', data);
                    const { token, trainer } = response.data;

                    // Set token in axios default headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({
                        token,
                        trainer,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.error || 'auth.registrationFailed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: () => {
                // Remove token from axios headers
                delete api.defaults.headers.common['Authorization'];

                set({
                    token: null,
                    trainer: null,
                    isAuthenticated: false
                });
            },

            clearError: () => set({ error: null }),

            checkAuth: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    // Set token in headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    const response = await api.get('/auth/me');
                    set({ trainer: response.data, isAuthenticated: true });
                } catch {
                    // Token is invalid, logout
                    get().logout();
                }
            },
        }),
        {
            name: 'ptmate-auth',
            partialize: (state) => ({ token: state.token, trainer: state.trainer }),
        }
    )
);

// Initialize auth on app load
const initAuth = () => {
    const { token, checkAuth } = useAuthStore.getState();
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        checkAuth();
    }
};

initAuth();
