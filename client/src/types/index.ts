// Client types
export interface Client {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    total_package_size: number;
    package_start_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientResponse extends Client {
    remaining_sessions: number;
    completed_sessions: number;
    no_show_sessions: number;
    cancelled_sessions: number;
    scheduled_sessions: number;
}

export interface CreateClientRequest {
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    total_package_size?: number;
    package_start_date?: string;
    notes?: string;
}

// Session types
export type SessionStatus = 'scheduled' | 'completed' | 'no_show' | 'cancelled';

export interface Session {
    id: string;
    client_id: string;
    scheduled_at: string;
    duration_minutes: number;
    status: SessionStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
    client?: Client;
}

export interface CreateSessionRequest {
    client_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    notes?: string;
}

// Measurement types
export interface Measurement {
    id: string;
    client_id: string;
    weight_kg?: number;
    height_cm?: number;
    body_fat_percent?: number;
    waist_cm?: number;
    hip_cm?: number;
    flexibility_cm?: number;
    notes?: string;
    measured_at: string;
    created_at: string;
}

export interface CreateMeasurementRequest {
    weight_kg?: number;
    height_cm?: number;
    body_fat_percent?: number;
    waist_cm?: number;
    hip_cm?: number;
    flexibility_cm?: number;
    notes?: string;
    measured_at?: string;
}

// Dashboard types
export interface DashboardData {
    today_sessions: Session[];
    total_clients: number;
    total_sessions: number;
    weekly_stats: {
        completed: number;
        no_show: number;
        cancelled: number;
        scheduled: number;
    };
    upcoming_sessions: Session[];
}
