**Role:** Senior Full Stack Engineer (Golang & React Specialist) & DevOps Practitioner.
**Project:** "PT Mate" (Personal Trainer CRM & Tracking System)
**Architecture:** Client-Server Monorepo (Dockerized).

**Objective:**
Build a high-performance, dark-mode web app for Personal Trainers. The system must run entirely on Docker with a separate Frontend and Backend service.
- **Frontend:** Mobile-First Web App (Responsive).
- **Backend:** High-performance Go REST API.
- **Database:** Self-hosted PostgreSQL.

**Tech Stack Requirements:**

1.  **Infrastructure (Docker):**
    - **Docker Compose:** Orchestrate 3 services: `frontend`, `backend`, and `db`.
    - **Development:** Enable Hot-Reloading for both React (Vite) and Go (Air or similar) inside containers.

2.  **Frontend (Containerized):**
    - **Framework:** React 18 (Vite).
    - **Styling:** Tailwind CSS, Lucide React (Icons).
    - **State:** Zustand (Global store).
    - **Network:** Axios (to consume the Go API).
    - **Design System:** Dark Mode (#121212 background). Primary Accent: Neon Lime (#CCFF00). Large touch targets.

3.  **Backend (Containerized):**
    - **Language:** Go (Golang) 1.21+.
    - **Framework:** **Gin Gonic** (preferred) or Echo.
    - **ORM:** GORM (for easier prototyping) or standard `database/sql`.
    - **Role:** Handle business logic, calculations, and DB CRUD operations.

4.  **Database:**
    - **System:** PostgreSQL (Alpine image).
    - **Persistence:** Use a named volume.

**Critical Business Logic & Rules (API Side):**

1.  **Smart Package Calculation:**
    - **Database:** Store `total_package_size` (e.g., 10). Do NOT store `remaining_sessions` as a static integer.
    - **API Response:** The API should calculate and return the remaining sessions dynamically based on the count of sessions with status `Completed` or `No-Show`.
    - **Formula:** `Remaining = Total - (Completed + No-Show)`.

2.  **Session Status Logic:**
    - **Completed:** Counts as used.
    - **No-Show:** Counts as used (Strict policy).
    - **Cancelled:** Does NOT count as used.

3.  **Historical Metrics:**
    - Measurements (Weight, Body Fat, etc.) must be stored as separate records with timestamps (`created_at`) to visualize progress charts later.

**Execution Plan:**

**Step 1: Architecture & Data Schema**
- Define the project folder structure (e.g., `/client`, `/server`).
- Create the **Docker Configuration** (`docker-compose.yml` and `Dockerfiles`).
- Define the **Go Structs / Database Schema** for:
    - `Client`
    - `Session` (with Enum for status)
    - `Measurement`
- Explain how the Foreign Keys will link these tables.

**Step 2: Implementation (Skeleton)**
- Initialize the React app.
- Initialize the Go Module and setup the Gin router.
- Connect Go to PostgreSQL.

**Instruction:**
**STOP** after Step 1. Present the **Docker Strategy** and **Go Structs (Schema)** for my approval. Do not write the full application code yet.