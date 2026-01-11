import { create } from 'zustand';
import type { ClientResponse, CreateClientRequest } from '../types';
import { clientsApi } from '../api/endpoints';

interface ClientStore {
    clients: ClientResponse[];
    selectedClient: ClientResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchClients: () => Promise<void>;
    fetchClient: (id: string) => Promise<void>;
    createClient: (data: CreateClientRequest) => Promise<void>;
    updateClient: (id: string, data: Partial<CreateClientRequest>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useClientStore = create<ClientStore>((set, get) => ({
    clients: [],
    selectedClient: null,
    isLoading: false,
    error: null,

    fetchClients: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await clientsApi.getAll();
            set({ clients: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch clients', isLoading: false });
        }
    },

    fetchClient: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await clientsApi.getById(id);
            set({ selectedClient: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to fetch client', isLoading: false });
        }
    },

    createClient: async (data: CreateClientRequest) => {
        set({ isLoading: true, error: null });
        try {
            await clientsApi.create(data);
            await get().fetchClients();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to create client', isLoading: false });
            throw error;
        }
    },

    updateClient: async (id: string, data: Partial<CreateClientRequest>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await clientsApi.update(id, data);
            set({ selectedClient: response.data, isLoading: false });
            await get().fetchClients();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to update client', isLoading: false });
            throw error;
        }
    },

    deleteClient: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await clientsApi.delete(id);
            await get().fetchClients();
        } catch (error: any) {
            set({ error: error.response?.data?.error || 'Failed to delete client', isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
