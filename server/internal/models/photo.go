package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PhotoGroup represents a group of photos uploaded together
type PhotoGroup struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key"`
	ClientID  uuid.UUID      `json:"client_id" gorm:"type:uuid;not null"`
	Client    Client         `json:"-" gorm:"foreignKey:ClientID"`
	Notes     string         `json:"notes"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Photos in this group
	Photos []Photo `json:"photos" gorm:"foreignKey:PhotoGroupID"`
}

// BeforeCreate generates UUID before creating
func (pg *PhotoGroup) BeforeCreate(tx *gorm.DB) error {
	if pg.ID == uuid.Nil {
		pg.ID = uuid.New()
	}
	return nil
}

// Photo represents a single photo in a group
type Photo struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primary_key"`
	PhotoGroupID uuid.UUID      `json:"photo_group_id" gorm:"type:uuid;not null"`
	PhotoGroup   PhotoGroup     `json:"-" gorm:"foreignKey:PhotoGroupID"`
	URL          string         `json:"url" gorm:"not null"`
	FileName     string         `json:"file_name"`
	FileSize     int64          `json:"file_size"`
	ContentType  string         `json:"content_type"`
	CreatedAt    time.Time      `json:"created_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

// BeforeCreate generates UUID before creating
func (p *Photo) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// CreatePhotoGroupRequest is the request body for creating a photo group
type CreatePhotoGroupRequest struct {
	Notes string `json:"notes"`
}
