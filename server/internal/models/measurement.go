package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Measurement represents a client's body measurement record
// Each measurement is a historical record with timestamps for progress tracking
type Measurement struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ClientID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"client_id"`
	WeightKg   *float64       `json:"weight_kg,omitempty"`    // Kilo
	NeckCm     *float64       `json:"neck_cm,omitempty"`      // Boyun
	ShoulderCm *float64       `json:"shoulder_cm,omitempty"`  // Omuz
	ChestCm    *float64       `json:"chest_cm,omitempty"`     // Göğüs
	WaistCm    *float64       `json:"waist_cm,omitempty"`     // Bel
	HipCm      *float64       `json:"hip_cm,omitempty"`       // Kalça
	RightArmCm *float64       `json:"right_arm_cm,omitempty"` // Sağ Kol
	LeftArmCm  *float64       `json:"left_arm_cm,omitempty"`  // Sol Kol
	RightLegCm *float64       `json:"right_leg_cm,omitempty"` // Sağ Bacak
	LeftLegCm  *float64       `json:"left_leg_cm,omitempty"`  // Sol Bacak
	Notes      string         `gorm:"type:text" json:"notes,omitempty"`
	MeasuredAt time.Time      `gorm:"not null;index" json:"measured_at"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationship
	Client Client `gorm:"foreignKey:ClientID" json:"client,omitempty"`
}

// CreateMeasurementRequest represents the request body for creating a measurement
type CreateMeasurementRequest struct {
	WeightKg   *float64  `json:"weight_kg"`
	NeckCm     *float64  `json:"neck_cm"`
	ShoulderCm *float64  `json:"shoulder_cm"`
	ChestCm    *float64  `json:"chest_cm"`
	WaistCm    *float64  `json:"waist_cm"`
	HipCm      *float64  `json:"hip_cm"`
	RightArmCm *float64  `json:"right_arm_cm"`
	LeftArmCm  *float64  `json:"left_arm_cm"`
	RightLegCm *float64  `json:"right_leg_cm"`
	LeftLegCm  *float64  `json:"left_leg_cm"`
	Notes      string    `json:"notes"`
	MeasuredAt time.Time `json:"measured_at"`
}

// TableName overrides the table name
func (Measurement) TableName() string {
	return "measurements"
}
