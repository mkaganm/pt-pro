package main

import (
	"log"
	"os"

	"ptmate/internal/config"
	"ptmate/internal/database"
	"ptmate/internal/handlers"
	"ptmate/internal/middleware"
	"ptmate/internal/models"
	"ptmate/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate database schemas
	if err := db.AutoMigrate(
		&models.Trainer{},
		&models.Client{},
		&models.Session{},
		&models.Measurement{},
		&models.Assessment{},
		&models.PhotoGroup{},
		&models.Photo{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully")

	// Setup Gin router
	router := gin.Default()

	// Set max multipart memory (8MB) - increase if needed
	router.MaxMultipartMemory = 8 << 20

	// Apply middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"service": "PT Mate API",
		})
	})

	// Setup API routes
	api := router.Group("/api/v1")
	{
		// Auth routes (public)
		authHandler := handlers.NewAuthHandler(db)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected routes (require authentication)
		protected := api.Group("")
		protected.Use(middleware.Auth())
		{
			// Get current user
			protected.GET("/auth/me", authHandler.GetMe)

			// Client routes
			clientHandler := handlers.NewClientHandler(db)
			clients := protected.Group("/clients")
			{
				clients.GET("", clientHandler.GetAll)
				clients.POST("", clientHandler.Create)
				clients.GET("/:id", clientHandler.GetByID)
				clients.PUT("/:id", clientHandler.Update)
				clients.DELETE("/:id", clientHandler.Delete)
				clients.GET("/:id/measurements", clientHandler.GetMeasurements)
				clients.POST("/:id/measurements", clientHandler.CreateMeasurement)
			}

			// Session routes
			sessionHandler := handlers.NewSessionHandler(db)
			sessions := protected.Group("/sessions")
			{
				sessions.GET("", sessionHandler.GetAll)
				sessions.POST("", sessionHandler.Create)
				sessions.GET("/:id", sessionHandler.GetByID)
				sessions.PUT("/:id", sessionHandler.Update)
				sessions.PATCH("/:id/status", sessionHandler.UpdateStatus)
				sessions.DELETE("/:id", sessionHandler.Delete)
			}

			// Measurement routes
			measurementHandler := handlers.NewMeasurementHandler(db)
			measurements := protected.Group("/measurements")
			{
				measurements.GET("/:id", measurementHandler.GetByID)
				measurements.PUT("/:id", measurementHandler.Update)
				measurements.DELETE("/:id", measurementHandler.Delete)
			}

			// Dashboard routes
			dashboardHandler := handlers.NewDashboardHandler(db)
			protected.GET("/dashboard", dashboardHandler.GetDashboard)
			protected.GET("/calendar", dashboardHandler.GetCalendar)

			// Assessment routes
			assessmentHandler := handlers.NewAssessmentHandler(db)
			clients.GET("/:id/assessments", assessmentHandler.GetAllByClientID)
			clients.POST("/:id/assessments", assessmentHandler.Create)

			// Individual assessment routes
			assessments := protected.Group("/assessments")
			{
				assessments.GET("/:id", assessmentHandler.GetByID)
				assessments.PUT("/:id", assessmentHandler.Update)
				assessments.DELETE("/:id", assessmentHandler.Delete)
			}

			// Photo routes
			var r2Service *services.R2Service
			if cfg.R2AccountID != "" && cfg.R2AccessKey != "" {
				r2Service, err = services.NewR2Service(
					cfg.R2AccountID,
					cfg.R2AccessKey,
					cfg.R2SecretKey,
					cfg.R2Bucket,
					cfg.R2PublicURL,
				)
				if err != nil {
					log.Printf("Warning: R2 service not initialized: %v", err)
				}
			}
			photoHandler := handlers.NewPhotoHandler(db, r2Service)
			clients.GET("/:id/photos", photoHandler.GetPhotoGroups)
			clients.POST("/:id/photos", photoHandler.UploadPhotos)

			// Photo group routes
			photoGroups := protected.Group("/photo-groups")
			{
				photoGroups.DELETE("/:id", photoHandler.DeletePhotoGroup)
			}
		}
	}

	// Get port from environment or default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting PT Mate API server on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
