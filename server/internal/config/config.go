package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	GinMode    string
	Port       string

	// R2 Storage
	R2AccountID string
	R2AccessKey string
	R2SecretKey string
	R2Bucket    string
	R2PublicURL string
}

// Load loads configuration from environment variables
func Load() *Config {
	// Load .env file if it exists (for local development)
	godotenv.Load()

	return &Config{
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "ptmate"),
		DBPassword:  getEnv("DB_PASSWORD", "ptmate_secret"),
		DBName:      getEnv("DB_NAME", "ptmate_db"),
		GinMode:     getEnv("GIN_MODE", "debug"),
		Port:        getEnv("PORT", "8080"),
		R2AccountID: getEnv("R2_ACCOUNT_ID", ""),
		R2AccessKey: getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2Bucket:    getEnv("R2_BUCKET_NAME", "ptmate-photos"),
		R2PublicURL: getEnv("R2_PUBLIC_URL", ""),
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
