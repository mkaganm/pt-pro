package handlers

import (
	"net/http"
	"time"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DashboardHandler handles dashboard-related HTTP requests
type DashboardHandler struct {
	db *gorm.DB
}

// NewDashboardHandler creates a new DashboardHandler
func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

// getTrainerID extracts trainer ID from context
func (h *DashboardHandler) getTrainerID(c *gin.Context) (uuid.UUID, bool) {
	trainerID, exists := c.Get("trainer_id")
	if !exists {
		return uuid.Nil, false
	}
	return trainerID.(uuid.UUID), true
}

// DashboardResponse represents the dashboard data
type DashboardResponse struct {
	TodaySessions    []models.Session `json:"today_sessions"`
	TotalClients     int64            `json:"total_clients"`
	TotalSessions    int64            `json:"total_sessions"`
	WeeklyStats      WeeklyStats      `json:"weekly_stats"`
	UpcomingSessions []models.Session `json:"upcoming_sessions"`
}

// WeeklyStats represents weekly session statistics
type WeeklyStats struct {
	Completed int64 `json:"completed"`
	NoShow    int64 `json:"no_show"`
	Cancelled int64 `json:"cancelled"`
	Scheduled int64 `json:"scheduled"`
}

// GetDashboard returns dashboard data for the authenticated trainer
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	trainerID, ok := h.getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	tomorrow := today.Add(24 * time.Hour)
	weekStart := today.AddDate(0, 0, -int(today.Weekday()))
	weekEnd := weekStart.AddDate(0, 0, 7)

	var response DashboardResponse

	// Get today's sessions for trainer's clients
	h.db.Preload("Client").
		Joins("JOIN clients ON clients.id = sessions.client_id").
		Where("clients.trainer_id = ?", trainerID).
		Where("sessions.scheduled_at >= ? AND sessions.scheduled_at < ?", today, tomorrow).
		Order("sessions.scheduled_at ASC").
		Find(&response.TodaySessions)

	// Get total clients for trainer
	h.db.Model(&models.Client{}).Where("trainer_id = ?", trainerID).Count(&response.TotalClients)

	// Get total sessions for trainer's clients
	h.db.Model(&models.Session{}).
		Joins("JOIN clients ON clients.id = sessions.client_id").
		Where("clients.trainer_id = ?", trainerID).
		Count(&response.TotalSessions)

	// Get weekly stats for trainer's clients
	h.db.Model(&models.Session{}).
		Joins("JOIN clients ON clients.id = sessions.client_id").
		Where("clients.trainer_id = ?", trainerID).
		Where("sessions.scheduled_at >= ? AND sessions.scheduled_at < ?", weekStart, weekEnd).
		Select(`
			COUNT(CASE WHEN sessions.status = 'completed' THEN 1 END) as completed,
			COUNT(CASE WHEN sessions.status = 'no_show' THEN 1 END) as no_show,
			COUNT(CASE WHEN sessions.status = 'cancelled' THEN 1 END) as cancelled,
			COUNT(CASE WHEN sessions.status = 'scheduled' THEN 1 END) as scheduled
		`).
		Scan(&response.WeeklyStats)

	// Get upcoming sessions (next 5)
	h.db.Preload("Client").
		Joins("JOIN clients ON clients.id = sessions.client_id").
		Where("clients.trainer_id = ?", trainerID).
		Where("sessions.scheduled_at > ? AND sessions.status = ?", now, models.SessionStatusScheduled).
		Order("sessions.scheduled_at ASC").
		Limit(5).
		Find(&response.UpcomingSessions)

	c.JSON(http.StatusOK, response)
}

// CalendarResponse represents calendar data
type CalendarResponse struct {
	Sessions []models.Session `json:"sessions"`
}

// GetCalendar returns sessions for calendar view
func (h *DashboardHandler) GetCalendar(c *gin.Context) {
	trainerID, ok := h.getTrainerID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	// Default to current month if not specified
	from := c.Query("from")
	to := c.Query("to")

	query := h.db.Preload("Client").
		Joins("JOIN clients ON clients.id = sessions.client_id").
		Where("clients.trainer_id = ?", trainerID)

	if from != "" {
		query = query.Where("sessions.scheduled_at >= ?", from)
	}
	if to != "" {
		query = query.Where("sessions.scheduled_at <= ?", to)
	}

	var sessions []models.Session
	if err := query.Order("sessions.scheduled_at ASC").Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}

	c.JSON(http.StatusOK, CalendarResponse{Sessions: sessions})
}
