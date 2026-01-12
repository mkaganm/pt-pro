package handlers

import (
	"net/http"
	"time"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ClientHandler handles client-related HTTP requests
type ClientHandler struct {
	db *gorm.DB
}

// NewClientHandler creates a new ClientHandler
func NewClientHandler(db *gorm.DB) *ClientHandler {
	return &ClientHandler{db: db}
}

// getTrainerID extracts trainer ID from context (set by auth middleware)
func getTrainerID(c *gin.Context) (uuid.UUID, bool) {
	trainerID, exists := c.Get("trainer_id")
	if !exists {
		return uuid.Nil, false
	}
	return trainerID.(uuid.UUID), true
}

// GetAll returns all clients for the authenticated trainer
func (h *ClientHandler) GetAll(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var clients []models.Client
	if err := h.db.Where("trainer_id = ?", trainerID).Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clients"})
		return
	}

	// Build response with calculated stats - initialize as empty slice, not nil
	responses := make([]models.ClientResponse, 0)
	for _, client := range clients {
		stats := h.getSessionStats(client.ID)
		usedSessions := stats.Completed + stats.NoShow
		remaining := client.TotalPackageSize - usedSessions

		responses = append(responses, models.ClientResponse{
			Client:            client,
			RemainingSessions: remaining,
			CompletedSessions: stats.Completed,
			NoShowSessions:    stats.NoShow,
			CancelledSessions: stats.Cancelled,
			ScheduledSessions: stats.Scheduled,
		})
	}

	c.JSON(http.StatusOK, responses)
}

// Create creates a new client for the authenticated trainer
func (h *ClientHandler) Create(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var req models.CreateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	client := models.Client{
		TrainerID:        trainerID,
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		Phone:            req.Phone,
		Email:            req.Email,
		TotalPackageSize: req.TotalPackageSize,
		PackageStartDate: req.PackageStartDate,
		Notes:            req.Notes,
	}

	if err := h.db.Create(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create client"})
		return
	}

	c.JSON(http.StatusCreated, client)
}

// GetByID returns a client by ID (only if belongs to trainer)
func (h *ClientHandler) GetByID(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	var client models.Client
	if err := h.db.Where("id = ? AND trainer_id = ?", id, trainerID).First(&client).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch client"})
		return
	}

	// Calculate session statistics
	stats := h.getSessionStats(client.ID)
	usedSessions := stats.Completed + stats.NoShow
	remaining := client.TotalPackageSize - usedSessions

	response := models.ClientResponse{
		Client:            client,
		RemainingSessions: remaining,
		CompletedSessions: stats.Completed,
		NoShowSessions:    stats.NoShow,
		CancelledSessions: stats.Cancelled,
		ScheduledSessions: stats.Scheduled,
	}

	c.JSON(http.StatusOK, response)
}

// Update updates a client (only if belongs to trainer)
func (h *ClientHandler) Update(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	var client models.Client
	if err := h.db.Where("id = ? AND trainer_id = ?", id, trainerID).First(&client).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch client"})
		return
	}

	var req models.UpdateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update only provided fields
	if req.FirstName != nil {
		client.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		client.LastName = *req.LastName
	}
	if req.Phone != nil {
		client.Phone = *req.Phone
	}
	if req.Email != nil {
		client.Email = *req.Email
	}
	if req.TotalPackageSize != nil {
		client.TotalPackageSize = *req.TotalPackageSize
	}
	if req.PackageStartDate != nil {
		client.PackageStartDate = req.PackageStartDate
	}
	if req.Notes != nil {
		client.Notes = *req.Notes
	}

	if err := h.db.Save(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update client"})
		return
	}

	c.JSON(http.StatusOK, client)
}

// Delete soft deletes a client (only if belongs to trainer)
func (h *ClientHandler) Delete(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	result := h.db.Where("id = ? AND trainer_id = ?", id, trainerID).Delete(&models.Client{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete client"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Client deleted successfully"})
}

// GetMeasurements returns all measurements for a client
func (h *ClientHandler) GetMeasurements(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	// Verify client belongs to trainer
	var client models.Client
	if err := h.db.Where("id = ? AND trainer_id = ?", id, trainerID).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	var measurements []models.Measurement
	if err := h.db.Where("client_id = ?", id).Order("measured_at DESC").Find(&measurements).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch measurements"})
		return
	}

	c.JSON(http.StatusOK, measurements)
}

// CreateMeasurement creates a new measurement for a client
func (h *ClientHandler) CreateMeasurement(c *gin.Context) {
	trainerID, ok := getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	// Verify client belongs to trainer
	var client models.Client
	if err := h.db.Where("id = ? AND trainer_id = ?", id, trainerID).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	var req models.CreateMeasurementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	measurement := models.Measurement{
		ClientID:       id,
		WeightKg:       req.WeightKg,
		HeightCm:       req.HeightCm,
		BodyFatPercent: req.BodyFatPercent,
		WaistCm:        req.WaistCm,
		HipCm:          req.HipCm,
		FlexibilityCm:  req.FlexibilityCm,
		Notes:          req.Notes,
		MeasuredAt:     req.MeasuredAt,
	}

	// Default to current time if not provided
	if measurement.MeasuredAt.IsZero() {
		measurement.MeasuredAt = time.Now()
	}

	if err := h.db.Create(&measurement).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create measurement"})
		return
	}

	c.JSON(http.StatusCreated, measurement)
}

// sessionStats holds session count by status
type sessionStats struct {
	Scheduled int
	Completed int
	NoShow    int
	Cancelled int
}

// getSessionStats calculates session statistics for a client
func (h *ClientHandler) getSessionStats(clientID uuid.UUID) sessionStats {
	var stats struct {
		Scheduled int64
		Completed int64
		NoShow    int64
		Cancelled int64
	}

	h.db.Model(&models.Session{}).
		Where("client_id = ?", clientID).
		Select(`
			COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
			COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show,
			COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
		`).
		Scan(&stats)

	return sessionStats{
		Scheduled: int(stats.Scheduled),
		Completed: int(stats.Completed),
		NoShow:    int(stats.NoShow),
		Cancelled: int(stats.Cancelled),
	}
}
