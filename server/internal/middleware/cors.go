package middleware

import (
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS returns a middleware handler that handles CORS
func CORS() gin.HandlerFunc {
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000"}

	// Add origins from environment variable (comma-separated)
	if origins := os.Getenv("CORS_ALLOWED_ORIGINS"); origins != "" {
		for _, origin := range strings.Split(origins, ",") {
			allowedOrigins = append(allowedOrigins, strings.TrimSpace(origin))
		}
	}

	config := cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}
	return cors.New(config)
}
