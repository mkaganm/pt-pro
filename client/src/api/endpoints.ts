import api from './client';
import type {
    ClientResponse,
    CreateClientRequest,
    Session,
    CreateSessionRequest,
    Measurement,
    CreateMeasurementRequest,
    DashboardData,
    SessionStatus,
} from '../types';

// Client endpoints
export const clientsApi = {
    getAll: () => api.get<ClientResponse[]>('/clients'),
    getById: (id: string) => api.get<ClientResponse>(`/clients/${id}`),
    create: (data: CreateClientRequest) => api.post<ClientResponse>('/clients', data),
    update: (id: string, data: Partial<CreateClientRequest>) => api.put<ClientResponse>(`/clients/${id}`, data),
    delete: (id: string) => api.delete(`/clients/${id}`),
    getMeasurements: (id: string) => api.get<Measurement[]>(`/clients/${id}/measurements`),
    createMeasurement: (id: string, data: CreateMeasurementRequest) => api.post<Measurement>(`/clients/${id}/measurements`, data),
};

// Session endpoints
export const sessionsApi = {
    getAll: (params?: { client_id?: string; status?: string; from?: string; to?: string }) =>
        api.get<Session[]>('/sessions', { params }),
    getById: (id: string) => api.get<Session>(`/sessions/${id}`),
    create: (data: CreateSessionRequest) => api.post<Session>('/sessions', data),
    update: (id: string, data: Partial<CreateSessionRequest>) => api.put<Session>(`/sessions/${id}`, data),
    updateStatus: (id: string, status: SessionStatus) => api.patch<Session>(`/sessions/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/sessions/${id}`),
};

// Measurement endpoints
export const measurementsApi = {
    getById: (id: string) => api.get<Measurement>(`/measurements/${id}`),
    delete: (id: string) => api.delete(`/measurements/${id}`),
};

// Dashboard endpoints
export const dashboardApi = {
    getData: () => api.get<DashboardData>('/dashboard'),
    getCalendar: (from?: string, to?: string) => api.get<{ sessions: Session[] }>('/calendar', { params: { from, to } }),
};
