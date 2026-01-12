package handlers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"ptmate/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct {
	db *gorm.DB
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// getJWTSecret returns the JWT secret key
func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "ptmate-super-secret-key-change-in-production"
	}
	return []byte(secret)
}

// parseValidationError converts validation errors to user-friendly Turkish messages
func parseValidationError(err error) string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		var messages []string
		for _, e := range validationErrors {
			field := e.Field()
			tag := e.Tag()

			switch field {
			case "Email":
				if tag == "required" {
					messages = append(messages, "Email adresi gerekli")
				} else if tag == "email" {
					messages = append(messages, "Geçerli bir email adresi girin")
				}
			case "Password":
				if tag == "required" {
					messages = append(messages, "Şifre gerekli")
				} else if tag == "min" {
					messages = append(messages, "Şifre en az 6 karakter olmalı")
				}
			case "FirstName":
				if tag == "required" {
					messages = append(messages, "Ad gerekli")
				}
			case "LastName":
				if tag == "required" {
					messages = append(messages, "Soyad gerekli")
				}
			default:
				messages = append(messages, field+" alanı geçersiz")
			}
		}
		if len(messages) > 0 {
			return strings.Join(messages, ", ")
		}
	}
	return "Geçersiz veri gönderildi"
}

// generateToken creates a JWT token for a trainer
func generateToken(trainer *models.Trainer) (string, error) {
	claims := jwt.MapClaims{
		"trainer_id": trainer.ID.String(),
		"email":      trainer.Email,
		"exp":        time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"iat":        time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTSecret())
}

// Register handles new trainer registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Parse validation errors for better messages
		errorMsg := parseValidationError(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": errorMsg})
		return
	}

	// Check if email already exists
	var existingTrainer models.Trainer
	if err := h.db.Where("email = ?", req.Email).First(&existingTrainer).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Bu email adresi zaten kayıtlı"})
		return
	}

	// Create new trainer
	trainer := models.Trainer{
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	if err := trainer.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Şifre oluşturulurken bir hata oluştu"})
		return
	}

	if err := h.db.Create(&trainer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hesap oluşturulurken bir hata oluştu"})
		return
	}

	// Generate token
	token, err := generateToken(&trainer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token oluşturulurken bir hata oluştu"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token:   token,
		Trainer: trainer,
	})
}

// Login handles trainer login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errorMsg := parseValidationError(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": errorMsg})
		return
	}

	// Find trainer by email
	var trainer models.Trainer
	if err := h.db.Where("email = ?", req.Email).First(&trainer).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email veya şifre hatalı"})
		return
	}

	// Verify password
	if !trainer.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email veya şifre hatalı"})
		return
	}

	// Generate token
	token, err := generateToken(&trainer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Giriş yapılırken bir hata oluştu"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token:   token,
		Trainer: trainer,
	})
}

// GetMe returns the current authenticated trainer
func (h *AuthHandler) GetMe(c *gin.Context) {
	// Get trainer ID from context (set by auth middleware)
	trainerID, exists := c.Get("trainer_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Oturum açmanız gerekiyor"})
		return
	}

	var trainer models.Trainer
	if err := h.db.First(&trainer, "id = ?", trainerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kullanıcı bulunamadı"})
		return
	}

	c.JSON(http.StatusOK, trainer)
}
