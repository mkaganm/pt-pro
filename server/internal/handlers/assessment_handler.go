package handlers

import (
	"net/http"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AssessmentHandler handles assessment-related HTTP requests
type AssessmentHandler struct {
	db *gorm.DB
}

// NewAssessmentHandler creates a new AssessmentHandler
func NewAssessmentHandler(db *gorm.DB) *AssessmentHandler {
	return &AssessmentHandler{db: db}
}

// GetByClientID returns an assessment by client ID
func (h *AssessmentHandler) GetByClientID(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	var assessment models.Assessment
	if err := h.db.Where("client_id = ?", clientID).First(&assessment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Assessment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assessment"})
		return
	}

	c.JSON(http.StatusOK, assessment)
}

// Create creates a new assessment for a client
func (h *AssessmentHandler) Create(c *gin.Context) {
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

	// Check if assessment already exists
	var existing models.Assessment
	if err := h.db.Where("client_id = ?", clientID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Assessment already exists for this client"})
		return
	}

	var req models.CreateAssessmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	assessment := models.Assessment{
		ClientID:             clientID,
		ParqHeartProblem:     req.ParqHeartProblem,
		ParqChestPain:        req.ParqChestPain,
		ParqDizziness:        req.ParqDizziness,
		ParqChronicCondition: req.ParqChronicCondition,
		ParqMedication:       req.ParqMedication,
		ParqBoneJoint:        req.ParqBoneJoint,
		ParqSupervision:      req.ParqSupervision,
		PostureHeadNeck:      req.PostureHeadNeck,
		PostureShoulders:     req.PostureShoulders,
		PostureLPHC:          req.PostureLPHC,
		PostureKnee:          req.PostureKnee,
		PostureFoot:          req.PostureFoot,
		PushUpForm:           req.PushUpForm,
		PushUpScapular:       req.PushUpScapular,
		PushUpLordosis:       req.PushUpLordosis,
		PushUpHeadPos:        req.PushUpHeadPos,
		SquatFeetOut:         req.SquatFeetOut,
		SquatKneesIn:         req.SquatKneesIn,
		SquatLowerBack:       req.SquatLowerBack,
		SquatArmsForward:     req.SquatArmsForward,
		SquatLeanForward:     req.SquatLeanForward,
		BalanceCorrect:       req.BalanceCorrect,
		BalanceKneeIn:        req.BalanceKneeIn,
		BalanceHipRise:       req.BalanceHipRise,
		ShoulderRetraction:   req.ShoulderRetraction,
		ShoulderProtraction:  req.ShoulderProtraction,
		ShoulderElevation:    req.ShoulderElevation,
		ShoulderDepression:   req.ShoulderDepression,
		Notes:                req.Notes,
	}

	if err := h.db.Create(&assessment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assessment"})
		return
	}

	c.JSON(http.StatusCreated, assessment)
}

// Update updates an existing assessment
func (h *AssessmentHandler) Update(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	var assessment models.Assessment
	if err := h.db.Where("client_id = ?", clientID).First(&assessment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Assessment not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assessment"})
		return
	}

	var req models.CreateAssessmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	assessment.ParqHeartProblem = req.ParqHeartProblem
	assessment.ParqChestPain = req.ParqChestPain
	assessment.ParqDizziness = req.ParqDizziness
	assessment.ParqChronicCondition = req.ParqChronicCondition
	assessment.ParqMedication = req.ParqMedication
	assessment.ParqBoneJoint = req.ParqBoneJoint
	assessment.ParqSupervision = req.ParqSupervision
	assessment.PostureHeadNeck = req.PostureHeadNeck
	assessment.PostureShoulders = req.PostureShoulders
	assessment.PostureLPHC = req.PostureLPHC
	assessment.PostureKnee = req.PostureKnee
	assessment.PostureFoot = req.PostureFoot
	assessment.PushUpForm = req.PushUpForm
	assessment.PushUpScapular = req.PushUpScapular
	assessment.PushUpLordosis = req.PushUpLordosis
	assessment.PushUpHeadPos = req.PushUpHeadPos
	assessment.SquatFeetOut = req.SquatFeetOut
	assessment.SquatKneesIn = req.SquatKneesIn
	assessment.SquatLowerBack = req.SquatLowerBack
	assessment.SquatArmsForward = req.SquatArmsForward
	assessment.SquatLeanForward = req.SquatLeanForward
	assessment.BalanceCorrect = req.BalanceCorrect
	assessment.BalanceKneeIn = req.BalanceKneeIn
	assessment.BalanceHipRise = req.BalanceHipRise
	assessment.ShoulderRetraction = req.ShoulderRetraction
	assessment.ShoulderProtraction = req.ShoulderProtraction
	assessment.ShoulderElevation = req.ShoulderElevation
	assessment.ShoulderDepression = req.ShoulderDepression
	assessment.Notes = req.Notes

	if err := h.db.Save(&assessment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update assessment"})
		return
	}

	c.JSON(http.StatusOK, assessment)
}

// Delete deletes an assessment
func (h *AssessmentHandler) Delete(c *gin.Context) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client ID"})
		return
	}

	result := h.db.Where("client_id = ?", clientID).Delete(&models.Assessment{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assessment"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assessment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assessment deleted successfully"})
}
