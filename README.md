# PT Mate - Personal Trainer CRM & Tracking System

A high-performance, dark-mode web application for Personal Trainers to manage clients, sessions, and body measurements.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- TailwindCSS for styling
- Zustand for state management
- Axios for API calls
- Lucide React for icons

### Backend
- Go 1.22 with Gin framework
- GORM for database operations
- PostgreSQL 16 database

### Infrastructure
- Docker & Docker Compose
- Hot-reload enabled for development

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd tracking-system
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### Development

The project supports hot-reload for both frontend and backend:

- **Frontend**: Any changes to files in `/client/src` will auto-reload
- **Backend**: Uses Air for Go hot-reload, changes to `/server` will auto-rebuild

### API Endpoints

#### Clients
- `GET /api/v1/clients` - List all clients
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients/:id` - Get client with stats
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

#### Sessions
- `GET /api/v1/sessions` - List sessions (supports filters)
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions/:id` - Get session
- `PUT /api/v1/sessions/:id` - Update session
- `PATCH /api/v1/sessions/:id/status` - Update status only
- `DELETE /api/v1/sessions/:id` - Delete session

#### Measurements
- `GET /api/v1/clients/:id/measurements` - Get client measurements
- `POST /api/v1/clients/:id/measurements` - Add measurement
- `GET /api/v1/measurements/:id` - Get measurement
- `DELETE /api/v1/measurements/:id` - Delete measurement

#### Dashboard
- `GET /api/v1/dashboard` - Dashboard data
- `GET /api/v1/calendar` - Calendar view data

## Business Logic

### Session Status
- **Scheduled**: Upcoming session
- **Completed**: Session completed (counts as used)
- **No-Show**: Client didn't attend (counts as used - strict policy)
- **Cancelled**: Session cancelled (does NOT count as used)

### Package Calculation
Remaining sessions are calculated dynamically:
```
Remaining = Total Package Size - (Completed + No-Show)
```

## Project Structure

```
tracking-system/
├── docker-compose.yml
├── .env.example
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # API client and endpoints
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   └── Dockerfile.dev
└── server/                 # Go Backend
    ├── internal/
    │   ├── config/        # Configuration
    │   ├── database/      # Database connection
    │   ├── handlers/      # HTTP handlers
    │   ├── middleware/    # Middleware
    │   └── models/        # GORM models
    └── Dockerfile.dev
```

## License

MIT
