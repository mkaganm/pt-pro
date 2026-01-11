package handlers

import (
	"net/http"
	"time"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
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

// GetDashboard returns dashboard data
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	tomorrow := today.Add(24 * time.Hour)
	weekStart := today.AddDate(0, 0, -int(today.Weekday()))
	weekEnd := weekStart.AddDate(0, 0, 7)

	var response DashboardResponse

	// Get today's sessions
	h.db.Preload("Client").
		Where("scheduled_at >= ? AND scheduled_at < ?", today, tomorrow).
		Order("scheduled_at ASC").
		Find(&response.TodaySessions)

	// Get total clients
	h.db.Model(&models.Client{}).Count(&response.TotalClients)

	// Get total sessions
	h.db.Model(&models.Session{}).Count(&response.TotalSessions)

	// Get weekly stats
	h.db.Model(&models.Session{}).
		Where("scheduled_at >= ? AND scheduled_at < ?", weekStart, weekEnd).
		Select(`
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
			COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show,
			COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
			COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled
		`).
		Scan(&response.WeeklyStats)

	// Get upcoming sessions (next 5)
	h.db.Preload("Client").
		Where("scheduled_at > ? AND status = ?", now, models.SessionStatusScheduled).
		Order("scheduled_at ASC").
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
	// Default to current month if not specified
	from := c.Query("from")
	to := c.Query("to")

	query := h.db.Preload("Client")

	if from != "" {
		query = query.Where("scheduled_at >= ?", from)
	}
	if to != "" {
		query = query.Where("scheduled_at <= ?", to)
	}

	var sessions []models.Session
	if err := query.Order("scheduled_at ASC").Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}

	c.JSON(http.StatusOK, CalendarResponse{Sessions: sessions})
}
