# server/Dockerfile (Production)
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod first
COPY go.mod ./

# Copy source code
COPY . .

# Download dependencies
RUN go mod tidy

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
