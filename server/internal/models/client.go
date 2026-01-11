package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Client represents a personal training client
type Client struct {
	ID               uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	FirstName        string         `gorm:"size:100;not null" json:"first_name"`
	LastName         string         `gorm:"size:100;not null" json:"last_name"`
	Phone            string         `gorm:"size:20" json:"phone"`
	Email            string         `gorm:"size:255" json:"email"`
	TotalPackageSize int            `gorm:"not null;default:0" json:"total_package_size"`
	PackageStartDate *time.Time     `json:"package_start_date,omitempty"`
	Notes            string         `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Sessions     []Session     `gorm:"foreignKey:ClientID" json:"sessions,omitempty"`
	Measurements []Measurement `gorm:"foreignKey:ClientID" json:"measurements,omitempty"`
}

// ClientResponse includes calculated fields for API responses
type ClientResponse struct {
	Client
	RemainingSessions int `json:"remaining_sessions"`
	CompletedSessions int `json:"completed_sessions"`
	NoShowSessions    int `json:"no_show_sessions"`
	CancelledSessions int `json:"cancelled_sessions"`
	ScheduledSessions int `json:"scheduled_sessions"`
}

// CreateClientRequest represents the request body for creating a client
type CreateClientRequest struct {
	FirstName        string     `json:"first_name" binding:"required"`
	LastName         string     `json:"last_name" binding:"required"`
	Phone            string     `json:"phone"`
	Email            string     `json:"email"`
	TotalPackageSize int        `json:"total_package_size"`
	PackageStartDate *time.Time `json:"package_start_date"`
	Notes            string     `json:"notes"`
}

// UpdateClientRequest represents the request body for updating a client
type UpdateClientRequest struct {
	FirstName        *string    `json:"first_name"`
	LastName         *string    `json:"last_name"`
	Phone            *string    `json:"phone"`
	Email            *string    `json:"email"`
	TotalPackageSize *int       `json:"total_package_size"`
	PackageStartDate *time.Time `json:"package_start_date"`
	Notes            *string    `json:"notes"`
}

// TableName overrides the table name
func (Client) TableName() string {
	return "clients"
}
