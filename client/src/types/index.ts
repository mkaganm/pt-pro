// Client types
export interface Client {
    id: string;
    trainer_id: string;
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
    neck_cm?: number;
    shoulder_cm?: number;
    chest_cm?: number;
    waist_cm?: number;
    hip_cm?: number;
    right_arm_cm?: number;
    left_arm_cm?: number;
    right_leg_cm?: number;
    left_leg_cm?: number;
    notes?: string;
    measured_at: string;
    created_at: string;
}

export interface CreateMeasurementRequest {
    weight_kg?: number;
    neck_cm?: number;
    shoulder_cm?: number;
    chest_cm?: number;
    waist_cm?: number;
    hip_cm?: number;
    right_arm_cm?: number;
    left_arm_cm?: number;
    right_leg_cm?: number;
    left_leg_cm?: number;
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

// Auth types
export interface Trainer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
}

export interface AuthResponse {
    token: string;
    trainer: Trainer;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

// Assessment types
export interface Assessment {
    id: string;
    client_id: string;

    // PARQ Test
    parq_heart_problem: boolean;
    parq_chest_pain: boolean;
    parq_dizziness: boolean;
    parq_chronic_condition: boolean;
    parq_medication: boolean;
    parq_bone_joint: boolean;
    parq_supervision: boolean;

    // Posture Analysis (1-3)
    posture_head_neck: number;
    posture_shoulders: number;
    posture_lphc: number;
    posture_knee: number;
    posture_foot: number;

    // Push Up Test (1-3)
    pushup_form: number;
    pushup_scapular: number;
    pushup_lordosis: number;
    pushup_head_pos: number;

    // Squat Test (1-3)
    squat_feet_out: number;
    squat_knees_in: number;
    squat_lower_back: number;
    squat_arms_forward: number;
    squat_lean_forward: number;

    // Balance Test (1-3)
    balance_correct: number;
    balance_knee_in: number;
    balance_hip_rise: number;

    // Shoulder Mobility (1-3)
    shoulder_retraction: number;
    shoulder_protraction: number;
    shoulder_elevation: number;
    shoulder_depression: number;

    notes?: string;
    created_at: string;
    updated_at: string;
}

export type CreateAssessmentRequest = Omit<Assessment, 'id' | 'client_id' | 'created_at' | 'updated_at'>;

// Photo types
export interface Photo {
    id: string;
    photo_group_id: string;
    url: string;
    file_name: string;
    file_size: number;
    content_type: string;
    created_at: string;
}

export interface PhotoGroup {
    id: string;
    client_id: string;
    notes?: string;
    photos: Photo[];
    created_at: string;
    updated_at: string;
}
