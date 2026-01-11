package handlers

import (
	"net/http"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MeasurementHandler handles measurement-related HTTP requests
type MeasurementHandler struct {
	db *gorm.DB
}

// NewMeasurementHandler creates a new MeasurementHandler
func NewMeasurementHandler(db *gorm.DB) *MeasurementHandler {
	return &MeasurementHandler{db: db}
}

// GetByID returns a measurement by ID
func (h *MeasurementHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid measurement ID"})
		return
	}

	var measurement models.Measurement
	if err := h.db.First(&measurement, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Measurement not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch measurement"})
		return
	}

	c.JSON(http.StatusOK, measurement)
}

// Delete soft deletes a measurement
func (h *MeasurementHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid measurement ID"})
		return
	}

	result := h.db.Delete(&models.Measurement{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete measurement"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Measurement not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Measurement deleted successfully"})
}
