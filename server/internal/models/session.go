package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SessionStatus represents the status of a training session
type SessionStatus string

const (
	SessionStatusScheduled SessionStatus = "scheduled"
	SessionStatusCompleted SessionStatus = "completed"
	SessionStatusNoShow    SessionStatus = "no_show"
	SessionStatusCancelled SessionStatus = "cancelled"
)

// Session represents a training session
type Session struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClientID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"client_id"`
	ScheduledAt     time.Time      `gorm:"not null;index" json:"scheduled_at"`
	DurationMinutes int            `gorm:"not null;default:60" json:"duration_minutes"`
	Status          SessionStatus  `gorm:"type:varchar(20);not null;default:'scheduled'" json:"status"`
	Notes           string         `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationship
	Client Client `gorm:"foreignKey:ClientID" json:"client,omitempty"`
}

// CreateSessionRequest represents the request body for creating a session
type CreateSessionRequest struct {
	ClientID        uuid.UUID `json:"client_id" binding:"required"`
	ScheduledAt     time.Time `json:"scheduled_at" binding:"required"`
	DurationMinutes int       `json:"duration_minutes"`
	Notes           string    `json:"notes"`
}

// UpdateSessionRequest represents the request body for updating a session
type UpdateSessionRequest struct {
	ScheduledAt     *time.Time     `json:"scheduled_at"`
	DurationMinutes *int           `json:"duration_minutes"`
	Status          *SessionStatus `json:"status"`
	Notes           *string        `json:"notes"`
}

// UpdateStatusRequest represents the request body for updating session status
type UpdateStatusRequest struct {
	Status SessionStatus `json:"status" binding:"required"`
}

// TableName overrides the table name
func (Session) TableName() string {
	return "sessions"
}

// IsUsed returns true if the session counts as "used" from the package
// Completed and NoShow both count as used sessions
func (s Session) IsUsed() bool {
	return s.Status == SessionStatusCompleted || s.Status == SessionStatusNoShow
}

// ValidStatuses returns all valid session statuses
func ValidStatuses() []SessionStatus {
	return []SessionStatus{
		SessionStatusScheduled,
		SessionStatusCompleted,
		SessionStatusNoShow,
		SessionStatusCancelled,
	}
}

// IsValidStatus checks if a status is valid
func IsValidStatus(status SessionStatus) bool {
	for _, s := range ValidStatuses() {
		if s == status {
			return true
		}
	}
	return false
}
