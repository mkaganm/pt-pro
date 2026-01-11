package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Measurement represents a client's body measurement record
// Each measurement is a historical record with timestamps for progress tracking
type Measurement struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClientID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"client_id"`
	WeightKg       *float64       `json:"weight_kg,omitempty"`
	HeightCm       *float64       `json:"height_cm,omitempty"`
	BodyFatPercent *float64       `json:"body_fat_percent,omitempty"`
	WaistCm        *float64       `json:"waist_cm,omitempty"`
	HipCm          *float64       `json:"hip_cm,omitempty"`
	FlexibilityCm  *float64       `json:"flexibility_cm,omitempty"`
	Notes          string         `gorm:"type:text" json:"notes,omitempty"`
	MeasuredAt     time.Time      `gorm:"not null;index" json:"measured_at"`
	CreatedAt      time.Time      `json:"created_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationship
	Client Client `gorm:"foreignKey:ClientID" json:"client,omitempty"`
}

// CreateMeasurementRequest represents the request body for creating a measurement
type CreateMeasurementRequest struct {
	WeightKg       *float64  `json:"weight_kg"`
	HeightCm       *float64  `json:"height_cm"`
	BodyFatPercent *float64  `json:"body_fat_percent"`
	WaistCm        *float64  `json:"waist_cm"`
	HipCm          *float64  `json:"hip_cm"`
	FlexibilityCm  *float64  `json:"flexibility_cm"`
	Notes          string    `json:"notes"`
	MeasuredAt     time.Time `json:"measured_at"`
}

// TableName overrides the table name
func (Measurement) TableName() string {
	return "measurements"
}
