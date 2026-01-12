package models

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Trainer represents a personal trainer (PT) user
type Trainer struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email        string         `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"size:255;not null" json:"-"`
	FirstName    string         `gorm:"size:100;not null" json:"first_name"`
	LastName     string         `gorm:"size:100;not null" json:"last_name"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Clients []Client `gorm:"foreignKey:TrainerID" json:"clients,omitempty"`
}

// RegisterRequest represents the request body for trainer registration
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
}

// LoginRequest represents the request body for login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents the response after successful authentication
type AuthResponse struct {
	Token   string  `json:"token"`
	Trainer Trainer `json:"trainer"`
}

// TableName overrides the table name
func (Trainer) TableName() string {
	return "trainers"
}

// SetPassword hashes and sets the password
func (t *Trainer) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	t.PasswordHash = string(hashedPassword)
	return nil
}

// CheckPassword verifies the password against the stored hash
func (t *Trainer) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(t.PasswordHash), []byte(password))
	return err == nil
}
