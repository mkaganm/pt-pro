package handlers

import (
	"net/http"

	"ptmate/internal/models"
	"ptmate/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PhotoHandler handles photo-related HTTP requests
type PhotoHandler struct {
	db        *gorm.DB
	r2Service *services.R2Service
}

// NewPhotoHandler creates a new PhotoHandler
func NewPhotoHandler(db *gorm.DB, r2Service *services.R2Service) *PhotoHandler {
	return &PhotoHandler{
		db:        db,
		r2Service: r2Service,
	}
}

// GetPhotoGroups returns all photo groups for a client
func (h *PhotoHandler) GetPhotoGroups(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	var groups []models.PhotoGroup
	if err := h.db.Where("client_id = ?", clientID).
		Preload("Photos").
		Order("created_at DESC").
		Find(&groups).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch photo groups"})
		return
	}

	c.JSON(http.StatusOK, groups)
}

// UploadPhotos uploads multiple photos as a group
func (h *PhotoHandler) UploadPhotos(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	// Check if client exists
	var client models.Client
	if err := h.db.First(&client, clientID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch client"})
		return
	}

	// Parse multipart form (max 50MB)
	if err := c.Request.ParseMultipartForm(50 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	form := c.Request.MultipartForm
	files := form.File["photos"]

	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No photos provided"})
		return
	}

	if len(files) > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 5 photos allowed per upload"})
		return
	}

	// Get notes from form
	notes := c.PostForm("notes")

	// Create photo group
	photoGroup := models.PhotoGroup{
		ClientID: clientID,
		Notes:    notes,
	}

	if err := h.db.Create(&photoGroup).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create photo group"})
		return
	}

	// Upload each photo
	var photos []models.Photo
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			continue
		}
		defer file.Close()

		// Check if R2 is configured
		if h.r2Service == nil {
			// Store locally or skip - for now we'll just record metadata
			photo := models.Photo{
				PhotoGroupID: photoGroup.ID,
				URL:          "/uploads/" + fileHeader.Filename,
				FileName:     fileHeader.Filename,
				FileSize:     fileHeader.Size,
				ContentType:  fileHeader.Header.Get("Content-Type"),
			}
			photos = append(photos, photo)
			continue
		}

		// Upload to R2
		url, err := h.r2Service.UploadFile(
			c.Request.Context(),
			file,
			fileHeader.Filename,
			fileHeader.Header.Get("Content-Type"),
			fileHeader.Size,
		)
		if err != nil {
			continue
		}

		photo := models.Photo{
			PhotoGroupID: photoGroup.ID,
			URL:          url,
			FileName:     fileHeader.Filename,
			FileSize:     fileHeader.Size,
			ContentType:  fileHeader.Header.Get("Content-Type"),
		}
		photos = append(photos, photo)
	}

	// Save photos to database
	if len(photos) > 0 {
		if err := h.db.Create(&photos).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save photos"})
			return
		}
	}

	// Reload with photos
	h.db.Preload("Photos").First(&photoGroup, photoGroup.ID)

	c.JSON(http.StatusCreated, photoGroup)
}

// DeletePhotoGroup deletes a photo group and its photos
func (h *PhotoHandler) DeletePhotoGroup(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid photo group ID"})
		return
	}

	var group models.PhotoGroup
	if err := h.db.Preload("Photos").First(&group, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Photo group not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch photo group"})
		return
	}

	// Delete photos from R2 if configured
	if h.r2Service != nil {
		for _, photo := range group.Photos {
			h.r2Service.DeleteFile(c.Request.Context(), photo.URL)
		}
	}

	// Delete photos from database
	h.db.Where("photo_group_id = ?", id).Delete(&models.Photo{})

	// Delete group
	if err := h.db.Delete(&group).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete photo group"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Photo group deleted successfully"})
}
