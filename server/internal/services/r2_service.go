package services

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

// R2Service handles file uploads to Cloudflare R2
type R2Service struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

// NewR2Service creates a new R2 service
func NewR2Service(accountID, accessKey, secretKey, bucket, publicURL string) (*R2Service, error) {
	if accountID == "" || accessKey == "" || secretKey == "" {
		return nil, fmt.Errorf("R2 credentials not configured")
	}

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 config: %w", err)
	}

	client := s3.NewFromConfig(cfg)

	return &R2Service{
		client:    client,
		bucket:    bucket,
		publicURL: publicURL,
	}, nil
}

// UploadFile uploads a file to R2 and returns the URL
func (s *R2Service) UploadFile(ctx context.Context, file io.Reader, fileName string, contentType string, size int64) (string, error) {
	// Generate unique file name
	ext := filepath.Ext(fileName)
	uniqueName := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	key := fmt.Sprintf("photos/%s", uniqueName)

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		Body:          file,
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// Return public URL
	if s.publicURL != "" {
		return fmt.Sprintf("%s/%s", s.publicURL, key), nil
	}
	return fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s", s.bucket, key), nil
}

// GetFile returns a file stream from R2
func (s *R2Service) GetFile(ctx context.Context, key string) (io.ReadCloser, string, error) {
	output, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to get file: %w", err)
	}

	contentType := "application/octet-stream"
	if output.ContentType != nil {
		contentType = *output.ContentType
	}

	return output.Body, contentType, nil
}

// DeleteFile deletes a file from R2
func (s *R2Service) DeleteFile(ctx context.Context, url string) error {
	// Extract key from URL
	// This is a simplified version - in production you'd parse the URL properly
	key := filepath.Base(url)
	if key == "" {
		return nil
	}

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(fmt.Sprintf("photos/%s", key)),
	})
	return err
}
