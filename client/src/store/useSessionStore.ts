import { create } from 'zustand';
import type { Session, CreateSessionRequest, SessionStatus } from '../types';
import { sessionsApi } from '../api/endpoints';

interface SessionStore {
    sessions: Session[];
    selectedSession: Session | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchSessions: (params?: { client_id?: string; status?: string; from?: string; to?: string }) => Promise<void>;
    fetchSession: (id: string) => Promise<void>;
    createSession: (data: CreateSessionRequest) => Promise<void>;
    updateSession: (id: string, data: Partial<CreateSessionRequest>) => Promise<void>;
    updateSessionStatus: (id: string, status: SessionStatus) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
    sessions: [],
    selectedSession: null,
    isLoading: false,
    error: null,

    fetchSessions: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await sessionsApi.getAll(params);
            set({ sessions: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch sessions', isLoading: false });
        }
    },

    fetchSession: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await sessionsApi.getById(id);
            set({ selectedSession: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch session', isLoading: false });
        }
    },

    createSession: async (data: CreateSessionRequest) => {
        set({ isLoading: true, error: null });
        try {
            await sessionsApi.create(data);
            await get().fetchSessions();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to create session', isLoading: false });
            throw error;
        }
    },

    updateSession: async (id: string, data: Partial<CreateSessionRequest>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await sessionsApi.update(id, data);
            set({ selectedSession: response.data, isLoading: false });
            await get().fetchSessions();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to update session', isLoading: false });
            throw error;
        }
    },

    updateSessionStatus: async (id: string, status: SessionStatus) => {
        set({ isLoading: true, error: null });
        try {
            await sessionsApi.updateStatus(id, status);
            await get().fetchSessions();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to update session status', isLoading: false });
            throw error;
        }
    },

    deleteSession: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await sessionsApi.delete(id);
            await get().fetchSessions();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to delete session', isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
