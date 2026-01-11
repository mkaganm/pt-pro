package handlers

import (
	"net/http"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SessionHandler handles session-related HTTP requests
type SessionHandler struct {
	db *gorm.DB
}

// NewSessionHandler creates a new SessionHandler
func NewSessionHandler(db *gorm.DB) *SessionHandler {
	return &SessionHandler{db: db}
}

// GetAll returns all sessions with optional filters
func (h *SessionHandler) GetAll(c *gin.Context) {
	var sessions []models.Session
	query := h.db.Preload("Client")

	// Filter by client_id if provided
	if clientID := c.Query("client_id"); clientID != "" {
		id, err := uuid.Parse(clientID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
			return
		}
		query = query.Where("client_id = ?", id)
	}

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		if !models.IsValidStatus(models.SessionStatus(status)) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}
		query = query.Where("status = ?", status)
	}

	// Filter by date range if provided
	if from := c.Query("from"); from != "" {
		query = query.Where("scheduled_at >= ?", from)
	}
	if to := c.Query("to"); to != "" {
		query = query.Where("scheduled_at <= ?", to)
	}

	if err := query.Order("scheduled_at ASC").Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}

// Create creates a new session
func (h *SessionHandler) Create(c *gin.Context) {
	var req models.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify client exists
	var client models.Client
	if err := h.db.First(&client, req.ClientID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify client"})
		return
	}

	session := models.Session{
		ClientID:        req.ClientID,
		ScheduledAt:     req.ScheduledAt,
		DurationMinutes: req.DurationMinutes,
		Status:          models.SessionStatusScheduled,
		Notes:           req.Notes,
	}

	// Default duration to 60 minutes
	if session.DurationMinutes == 0 {
		session.DurationMinutes = 60
	}

	if err := h.db.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Load client for response
	h.db.Preload("Client").First(&session, session.ID)

	c.JSON(http.StatusCreated, session)
}

// GetByID returns a session by ID
func (h *SessionHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var session models.Session
	if err := h.db.Preload("Client").First(&session, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch session"})
		return
	}

	c.JSON(http.StatusOK, session)
}

// Update updates a session
func (h *SessionHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var session models.Session
	if err := h.db.First(&session, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch session"})
		return
	}

	var req models.UpdateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update only provided fields
	if req.ScheduledAt != nil {
		session.ScheduledAt = *req.ScheduledAt
	}
	if req.DurationMinutes != nil {
		session.DurationMinutes = *req.DurationMinutes
	}
	if req.Status != nil {
		if !models.IsValidStatus(*req.Status) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}
		session.Status = *req.Status
	}
	if req.Notes != nil {
		session.Notes = *req.Notes
	}

	if err := h.db.Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update session"})
		return
	}

	c.JSON(http.StatusOK, session)
}

// UpdateStatus updates only the status of a session
func (h *SessionHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var session models.Session
	if err := h.db.First(&session, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch session"})
		return
	}

	var req models.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !models.IsValidStatus(req.Status) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Valid values: scheduled, completed, no_show, cancelled"})
		return
	}

	session.Status = req.Status

	if err := h.db.Save(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update session status"})
		return
	}

	c.JSON(http.StatusOK, session)
}

// Delete soft deletes a session
func (h *SessionHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	result := h.db.Delete(&models.Session{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete session"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Session deleted successfully"})
}
