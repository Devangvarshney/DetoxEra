# AyurSutra — Master Project Specification & Comprehensive Technology Inventory

> **Problem Statement ID:** 25023  
> **Organization:** Ministry of Ayush  
> **Domain:** MedTech / BioTech / HealthTech / Digital Therapeutics  
> **Project Title:** AyurSutra — Panchakarma Patient Management & Therapy Scheduling Platform  
> **Repository Scope:** Web Application (Next.js 16 + React 19) • Hybrid Mobile Application (Capacitor 8 Android APK) • REST Backend (FastAPI + Python) • Database (Supabase PostgreSQL & MySQL)

---

## 📋 Table of Contents

1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Technology Stack Inventory (Version & Purpose Matrix)](#3-technology-stack-inventory-version--purpose-matrix)
   - [Frontend Web Stack](#31-frontend-web-stack)
   - [Mobile / Hybrid App Stack](#32-mobile--hybrid-app-stack)
   - [Backend API Stack](#33-backend-api-stack)
   - [Database & Storage Stack](#34-database--storage-stack)
   - [DevOps, Tooling & Build Tools](#35-devops-tooling--build-tools)
4. [Classical Panchakarma Clinical Protocols & Domain Modeling](#4-classical-panchakarma-clinical-protocols--domain-modeling)
5. [Database Architecture & Complete Entity Data Dictionary](#5-database-architecture--complete-entity-data-dictionary)
6. [Complete REST API Specification](#6-complete-rest-api-specification)
7. [Frontend Routing & Component Architecture](#7-frontend-routing--component-architecture)
8. [Specialized Interactive Features](#8-specialized-interactive-features)
   - [Panchakarma Reels View (Vertical Video Feed & Factsheets)](#81-panchakarma-reels-view)
   - [Google Maps Simulator & Clinic Locator](#82-google-maps-simulator--clinic-locator)
   - [Recovery Trajectory & Feedback Visualization](#83-recovery-trajectory--feedback-visualization)
9. [Authentication & Security Implementation](#9-authentication--security-implementation)
10. [Environment Variables & Configuration Reference](#10-environment-variables--configuration-reference)
11. [Directory & File Tree Map](#11-directory--file-tree-map)
12. [Local Setup, Execution & Build Instructions](#12-local-setup-execution--build-instructions)

---

## 1. Project Overview & Problem Statement

### 1.1 Background & Context
Panchakarma is an ancient, five-fold classical Ayurvedic detoxification and rejuvenation system gaining significant global recognition. With the global Ayurveda market projected to expand beyond USD 16 billion, traditional clinical practices still rely heavily on manual paper logs, informal scheduling, and verbal precautions. This causes:
- Inefficient manual scheduling prone to practitioner and patient time clashes.
- Inconsistent treatment adherence due to missed preparatory (*Purvakarma*) and recovery (*Paschatkarma*) guidelines.
- Absence of standardized digital outcome tracking, symptom logs, and patient satisfaction metrics.
- Fragmented discovery of qualified Ayurvedic Vaidyas and accredited Panchakarma clinics.

### 1.2 The AyurSutra Solution
AyurSutra bridges traditional Ayurvedic authenticity with modern clinical engineering. The platform provides:
- **Intelligent Therapy Scheduling:** Automated multi-session plans with chronological sequence validation.
- **Automated Precautions Engine:** Strict pre-procedure (*Snehana*, *Swedana*, fasting) and post-procedure (*Samsarjana Krama* diet) alerts and notifications.
- **Recovery Milestones & Symptom Analytics:** Visual progress bars, feedback loops, and interactive charts tracking patient recovery trajectories.
- **Interactive Doctor & Clinic Discovery:** Map-based geographic search covering major Indian clusters (Delhi NCR, Punjab/Chandigarh, Kerala, Mumbai/Pune).
- **Modern Digital Media Experience:** TikTok/Instagram-style educational reels view showcasing authentic procedural videos, indications, and clinical factsheets.
- **Cross-Platform Accessibility:** Modern web app accessible on desktop and mobile browsers, paired with an offline-capable Android APK powered by Capacitor.

---

## 2. End-to-End System Architecture

AyurSutra utilizes a modern **Decoupled Client-Server & Mobile Hybrid Architecture**:

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                                CLIENT LAYER                                 │
 │                                                                             │
 │   Next.js 16 (React 19, TypeScript)          Capacitor 8 (Android Native)   │
 │   • Desktop / Mobile Web Browsers            • Native Hardware Back-Button  │
 │   • Responsive Tailwind v4 Layouts           • Social Login (Google Native) │
 │   • Static Export ('out')                    • Standalone APK (AyurSutra)   │
 └──────────────────────┬──────────────────────────────────┬───────────────────┘
                        │ HTTP / REST (Axios)              │
                        │ JSON Web Tokens (Bearer Auth)    │
                        ▼                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                               BACKEND LAYER                                 │
 │                                                                             │
 │   FastAPI (Python 3.9+) on Uvicorn ASGI Server                              │
 │   • API Routers (Auth, Patients, Practitioners, Therapy, Analytics, etc.)   │
 │   • Pydantic v2 (Input Validation & Output Schemata)                        │
 │   • Service Layer (Business Logic & Automation Engine)                      │
 │   • Security (Passlib Bcrypt Hashing, Python-JOSE JWT Engine)               │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ SQLAlchemy 2.0 ORM
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                               DATABASE LAYER                                │
 │                                                                             │
 │   Primary Cloud: Supabase (PostgreSQL 15+) via Psycopg2                     │
 │   Local Fallback: MySQL 8.0+ via PyMySQL                                    │
 │   Schema Evolution: Alembic Database Migrations                             │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack Inventory (Version & Purpose Matrix)

### 3.1 Frontend Web Stack

| Library / Tool | Version | Purpose in AyurSutra |
| :--- | :--- | :--- |
| **Next.js** | `16.3.5` | React framework providing App Router (`app/`), SSR, Client Components, Static Site Generation (`output: "export"`), and optimized routing. |
| **React** | `19.2.8` | Core UI component library enabling stateful component lifecycle and rendering. |
| **React-DOM** | `19.2.8` | DOM renderer for React web applications. |
| **TypeScript** | `^5.0.0` | Strict static typing for all interfaces, props, API payloads, and Panchakarma data models. |
| **Tailwind CSS** | `^4.0.0` | Modern utility-first CSS engine with custom variables for herbal Ayurvedic color palettes (`--primary-green`, `--ayur-accent`, dark mode). |
| **@tailwindcss/postcss** | `^4.0.0` | PostCSS plugin integrating Tailwind v4 with the Next.js compilation pipeline. |
| **PostCSS** | Latest | CSS post-processing engine. |
| **Lucide React** | `^1.45.0` | Comprehensive icon library (e.g., `Stethoscope`, `Leaf`, `Calendar`, `MapPin`, `Activity`, `Bell`, `Sparkles`). |
| **@tanstack/react-query** | `^5.102.8` | Server state management, intelligent caching, background polling, and optimistic UI mutations for therapy sessions. |
| **Axios** | `^1.20.0` | Promise-based HTTP client pre-configured with interceptors, timeout handling, and authorization headers (`lib/api/client.ts`). |
| **React Hook Form** | `^7.88.0` | High-performance, declarative form state handling with minimal re-renders for multi-step registrations and therapy creation. |
| **Zod** | `^3.25.76` | Schema declaration and validation library validating registration forms and inputs. |
| **@hookform/resolvers** | `^5.9.1` | Seamless integration bridge between Zod schemas and React Hook Form. |
| **Recharts** | `^3.10.1` | Composable charting library powering patient symptom recovery trajectories, practitioner monthly volume, and ratings charts. |
| **clsx** | `^2.1.1` | Utility for conditionally concatenating CSS class names. |
| **tailwind-merge** | `^3.7.0` | Utility to safely merge Tailwind CSS classes in JS without class precedence conflicts. |
| **date-fns** | `^4.4.0` | Modern, modular JavaScript date utility library for scheduling, session dates, and timeline calculations. |
| **@react-oauth/google** | `^0.13.5` | Google Identity Services OAuth provider for web-based single-click patient/practitioner sign-in. |

---

### 3.2 Mobile / Hybrid App Stack

| Library / Tool | Version | Purpose in AyurSutra |
| :--- | :--- | :--- |
| **@capacitor/core** | `^8.5.2` | Core cross-platform native runtime bridging web assets with Android system APIs. |
| **@capacitor/cli** | `^7.6.9` | CLI tooling to synchronize web assets (`npx cap sync`), copy builds, and run Android Studio targets. |
| **@capacitor/android** | `^8.5.2` | Android native platform bridge generating the Gradle project structure. |
| **@capacitor/app** | `^8.1.1` | Native app lifecycle manager listening for hardware back-button presses and app state events. |
| **@capgo/capacitor-social-login** | `^8.5.10` | Native Android plugin for seamless Google One-Tap / Social authentication on mobile devices. |
| **Android SDK & Gradle** | Gradle 8+ | Native build system producing the standalone `AyurSutra.apk` application package. |

---

### 3.3 Backend API Stack

| Package / Library | Version | Purpose in AyurSutra |
| :--- | :--- | :--- |
| **FastAPI** | Latest (v0.100+) | Modern, high-performance web framework for building REST APIs with automatic OpenAPI (Swagger) documentation. |
| **Uvicorn** | `[standard]` | Lightning-fast ASGI web server implementation for Python handling concurrent asynchronous HTTP requests. |
| **SQLAlchemy** | Latest (v2.0+) | Object Relational Mapper (ORM) defining relational models, relationships, cascading deletes, and complex queries. |
| **Pydantic** | `[email]` (v2) | Data validation, serializing/deserializing schemas, and enforcing strict data models for all requests/responses. |
| **pydantic-settings** | Latest | BaseSettings configuration management loading `.env` variables and constructing dynamic database URLs. |
| **passlib** | `[bcrypt]` | Secure password hashing library using Bcrypt algorithm with salt rounds. |
| **bcrypt** | `4.0.1` | Direct low-level C-bindings for Bcrypt password encryption. |
| **python-jose** | `[cryptography]` | Complete JavaScript Object Signing and Encryption (JOSE) library generating and verifying JWT tokens. |
| **python-multipart** | Latest | Streaming multipart parser enabling form-data handling for OAuth2 password authentication endpoints. |
| **python-dotenv** | Latest | Reads key-value pairs from `.env` and sets them as environment variables. |
| **google-auth** | Latest | Google authentication library used to verify incoming Google ID tokens on the backend. |
| **requests** & **httpx** | Latest | Synchronous and asynchronous HTTP clients for verifying external tokens and communicating with microservices. |
| **pytest** | Latest | Python testing framework for writing automated unit and integration tests. |

---

### 3.4 Database & Storage Stack

| Technology | Role | Details |
| :--- | :--- | :--- |
| **PostgreSQL (Supabase)** | Primary Cloud Database | Hosted on Supabase (`db.nxyzpcrieucfvckrsayc.supabase.co:5432`). Uses `psycopg2-binary` driver with SSL encryption. |
| **MySQL Server** | Local Database Option | Local relational database using `pymysql` driver (`mysql+pymysql://root:...@localhost:3306/ayursutra`). |
| **Alembic** | Migration Management | Database schema version control engine handling automated migration scripts (`alembic upgrade head`). |

---

### 3.5 DevOps, Tooling & Build Tools

- **Node.js**: v18+ / v20+ JavaScript runtime.
- **Python**: 3.9+ / 3.11+ backend runtime.
- **Git**: Version control system tracking repository history and commits.
- **Android Studio / Android SDK Platform-Tools**: Compiling the hybrid APK, signing debug keys, and managing ADB communication.

---

## 4. Classical Panchakarma Clinical Protocols & Domain Modeling

AyurSutra encodes authentic classical Ayurvedic literature (Charaka Samhita & Sushruta Samhita) into functional software models:

### 4.1 The Three Classical Treatment Stages
1. **Purvakarma (Preparatory Stage):**
   - *Snehana* (Internal & External Oleation): Consuming medicated ghee (*Ghrita*) in progressive doses and warm herbal oil applications.
   - *Swedana* (Herbal Fomentation/Sudation): Induced sweating to liquefy deep-seated toxins (*Ama*) and channel them to the gastrointestinal tract (*Kostha*).
2. **Pradhanakarma (Primary Purification Procedures):**
   - The five fundamental therapies executed under strict clinical supervision.
3. **Paschatkarma (Post-Therapy Restoration Stage):**
   - *Samsarjana Krama*: Strict graduated diet restarting digestive fire (*Agni*) from thin rice gruel (*Peya*), thick gruel (*Vilepi*), to normal food.
   - Lifestyle restrictions: Avoidance of direct air conditioning, sun exposure, heavy exertion, and mental strain.

### 4.2 The 5 Classical Therapies (*Pradhana Karmas*) + Ancillary Modalities

| Therapy | Sanskrit Term | Primary Target Dosha | Clinical Indications | Classical Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Vamana** | वमन कर्म | **Kapha** | Chronic asthma, bronchitis, allergic rhinitis, metabolic heaviness, obesity, psoriasis, hyperacidity. | 7 – 14 Days |
| **Virechana** | विरेचन कर्म | **Pitta** | Liver disorders, chronic dermatitis, eczema, chronic fever, hyperacidity, metabolic detox. | 5 – 10 Days |
| **Basti** | बस्ति कर्म | **Vata** | Sciatica, arthritis, paralysis, lumbar spondylosis, chronic constipation, neuromuscular degeneration. | 8 – 30 Days (Karma/Kala/Yoga Basti) |
| **Nasya** | नस्य कर्म | **Urdhva Jatrugata (ENT & Head)** | Migraines, sinusitis, cervical spondylosis, premature graying, facial palsy, insomnia. | 7 – 14 Days |
| **Raktamokshana** | रक्तमोक्षण | **Rakta & Pitta** | Chronic skin lesions, varicose ulcers, gout, inflammatory arthritis, localized toxic stagnation. | 3 – 5 Sessions |
| **Shirodhara** | शिरोधारा | **Vata-Pitta (Mind & Nerves)** | Anxiety, chronic insomnia, hypertension, PTSD, mental exhaustion, burnout. | 7 – 14 Sessions |
| **Abhyanga** | अभ्यङ्ग | **Vata** | Body stiffness, fatigue, dry skin, muscle aches, anti-aging tissue nourishment. | 7 – 21 Sessions |

---

## 5. Database Architecture & Complete Entity Data Dictionary

The platform operates on **10 normalized relational entities**:

```
 ┌─────────────┐       1:1       ┌──────────────────┐
 │    User     ├────────────────►│  PatientProfile  │
 └───┬─────┬───┘                 └────────┬─────────┘
     │     │                              │ 1:N
     │     │ 1:1                          │
     │     └────────►┌──────────────────┐ │
     │               │PractitionerProfile│ │
     │               └────────┬─────────┘ │
     │ 1:N                    │ 1:N       │
     ▼                        ▼           ▼
┌──────────────┐     ┌───────────────────────────────┐
│ Notification │     │       TreatmentRequest        │
└──────────────┘     └───────────────────────────────┘
                                  │
                                  ▼
                     ┌───────────────────────────────┐
                     │          TherapyPlan          │◄─── [TherapyTemplate]
                     └───────┬───────────────┬───────┘
                             │ 1:N           │ 1:N
                             ▼               ▼
                 ┌──────────────────┐  ┌──────────────────┐
                 │  TherapySession  │  │ TherapyMilestone │
                 └────────┬─────────┘  └──────────────────┘
                          │ 1:1
                          ▼
                 ┌──────────────────┐
                 │     Feedback     │
                 └──────────────────┘
```

### Table 1: `users`
- `id` (INT, PK, Auto-increment)
- `email` (VARCHAR(255), Unique, Indexed)
- `hashed_password` (VARCHAR(255), Not Null)
- `role` (ENUM: `'patient'`, `'practitioner'`, Indexed)
- `is_active` (BOOLEAN, Default: `True`)
- `created_at` (DATETIME, Server Default: `NOW()`)
- `updated_at` (DATETIME, Server Default: `NOW()`, OnUpdate: `NOW()`)

### Table 2: `patients`
- `id` (INT, PK, Auto-increment)
- `user_id` (INT, FK -> `users.id`, Unique, Not Null)
- `name` (VARCHAR(255), Not Null)
- `phone` (VARCHAR(50))
- `age` (INT)
- `gender` (VARCHAR(50))
- `address` (VARCHAR(500))
- `profile_info` (VARCHAR(1000))

### Table 3: `practitioners`
- `id` (INT, PK, Auto-increment)
- `user_id` (INT, FK -> `users.id`, Unique, Not Null)
- `name` (VARCHAR(255), Not Null)
- `specialization` (VARCHAR(255))
- `qualification` (VARCHAR(255))
- `experience` (VARCHAR(255))
- `city` (VARCHAR(255), Indexed)
- `bio` (VARCHAR(1000))
- `availability` (VARCHAR(500))

### Table 4: `treatment_requests`
- `id` (INT, PK, Auto-increment)
- `patient_id` (INT, FK -> `patients.id`, Indexed, Not Null)
- `practitioner_id` (INT, FK -> `practitioners.id`, Indexed, Not Null)
- `message` (TEXT)
- `status` (ENUM: `'pending'`, `'accepted'`, `'rejected'`, `'cancelled'`, Default: `'pending'`)
- `created_at` (DATETIME, Server Default: `NOW()`)
- `updated_at` (DATETIME, Server Default: `NOW()`, OnUpdate: `NOW()`)

### Table 5: `therapy_templates`
- `id` (INT, PK, Auto-increment)
- `name` (VARCHAR(255), Not Null)
- `description` (TEXT)
- `recommended_session_count` (INT, Default: `1`)
- `default_session_duration` (INT, Default: `60` minutes)
- `instructions` (TEXT)

### Table 6: `therapy_plans`
- `id` (INT, PK, Auto-increment)
- `patient_id` (INT, FK -> `patients.id`, Indexed, Not Null)
- `practitioner_id` (INT, FK -> `practitioners.id`, Indexed, Not Null)
- `template_id` (INT, FK -> `therapy_templates.id`, Nullable)
- `title` (VARCHAR(255), Not Null)
- `description` (TEXT)
- `number_of_sessions` (INT, Not Null)
- `session_duration` (INT, Default: `60`)
- `notes` (TEXT)
- `created_at` (DATETIME, Server Default: `NOW()`)
- `updated_at` (DATETIME, Server Default: `NOW()`, OnUpdate: `NOW()`)

### Table 7: `therapy_sessions`
- `id` (INT, PK, Auto-increment)
- `therapy_plan_id` (INT, FK -> `therapy_plans.id`, Cascade Delete, Indexed, Not Null)
- `session_number` (INT, Not Null)
- `status` (ENUM: `'pending'`, `'scheduled'`, `'completed'`, `'cancelled'`, Default: `'pending'`)
- `scheduled_date` (DATE, Indexed, Nullable)
- `start_time` (TIME, Nullable)
- `end_time` (TIME, Nullable)
- `duration` (INT, Not Null, minutes)
- `practitioner_notes` (TEXT)
- `patient_notes` (TEXT)
- `pre_precautions` (TEXT, Nullable — Pre-session fasting/diet guidance)
- `post_precautions` (TEXT, Nullable — Post-procedure diet and recovery rules)
- `completed_at` (DATETIME, Nullable)
- `created_at` (DATETIME, Server Default: `NOW()`)
- `updated_at` (DATETIME, Server Default: `NOW()`, OnUpdate: `NOW()`)

### Table 8: `therapy_milestones`
- `id` (INT, PK, Auto-increment)
- `therapy_plan_id` (INT, FK -> `therapy_plans.id`, Cascade Delete, Indexed, Not Null)
- `title` (VARCHAR(255), Not Null)
- `description` (TEXT)
- `target_session` (INT, Nullable)
- `is_achieved` (BOOLEAN, Default: `False`)
- `achieved_at` (DATETIME, Nullable)
- `created_at` (DATETIME, Server Default: `NOW()`)

### Table 9: `feedback`
- `id` (INT, PK, Auto-increment)
- `session_id` (INT, FK -> `therapy_sessions.id`, Unique, Not Null)
- `patient_id` (INT, FK -> `patients.id`, Not Null)
- `practitioner_id` (INT, FK -> `practitioners.id`, Not Null)
- `rating` (INT, 1 to 5, Not Null)
- `comments` (TEXT)
- `symptoms_reported` (TEXT, Nullable — comma-separated symptom tags)
- `improvement_level` (INT, 1 to 5, Nullable — recovery score)
- `created_at` (DATETIME, Server Default: `NOW()`)

### Table 10: `notifications`
- `id` (INT, PK, Auto-increment)
- `user_id` (INT, FK -> `users.id`, Indexed, Not Null)
- `type` (VARCHAR(50), Not Null — e.g. `'pre_precaution'`, `'post_precaution'`, `'schedule'`, `'request'`)
- `title` (VARCHAR(255), Not Null)
- `message` (TEXT, Not Null)
- `related_entity_type` (VARCHAR(50))
- `related_entity_id` (INT)
- `is_read` (BOOLEAN, Default: `False`, Indexed)
- `created_at` (DATETIME, Server Default: `NOW()`)
- `read_at` (DATETIME, Nullable)

---

## 6. Complete REST API Specification

### 6.1 Authentication (`/auth`)
- `POST /auth/register/patient` — Register a new patient account with profile details.
- `POST /auth/register/practitioner` — Register a verified practitioner account with credentials, city, and specialization.
- `POST /auth/login` — Standard OAuth2 password form login returning Bearer JWT token.
- `POST /auth/google` — Google Identity token exchange registering or logging in patient/practitioner.
- `GET /auth/me` — Fetches current authenticated user profile and roles.

### 6.2 Patients (`/patients`)
- `GET /patients/me` — Fetch currently logged-in patient's full clinical profile.
- `PATCH /patients/me` — Update patient contact info, age, gender, and medical notes.

### 6.3 Practitioners (`/practitioners`)
- `GET /practitioners?city={city}` — List registered practitioners with optional city filtering.
- `GET /practitioners/{id}` — Get detailed profile, qualifications, and clinic details of a practitioner.
- `GET /practitioners/me/profile` — Fetch the logged-in practitioner's profile.
- `PATCH /practitioners/me` — Update practitioner bio, availability hours, and specialization.

### 6.4 Treatment Requests (`/treatment-requests`)
- `POST /treatment-requests` — Patient submits a new Panchakarma treatment request to a doctor.
- `GET /treatment-requests/sent` — Patient views list of their outgoing treatment requests.
- `GET /treatment-requests/received` — Practitioner views incoming requests from patients.
- `PATCH /treatment-requests/{id}` — Practitioner updates request status (`accepted`, `'rejected'`).

### 6.5 Therapy Plans & Sessions (`/therapy`)
- `GET /therapy/templates` — List classical pre-seeded Panchakarma therapy templates.
- `POST /therapy/plans` — Practitioner creates a personalized multi-session therapy plan.
- `GET /therapy/plans` — Fetch active therapy plans for current user (filtered by role).
- `GET /therapy/plans/{plan_id}` — View single therapy plan details.
- `GET /therapy/plans/{plan_id}/sessions` — Retrieve all chronological sessions of a plan.
- `GET /therapy/sessions` — Fetch all scheduled and completed sessions.
- `GET /therapy/plans/{plan_id}/progress` — Fetch overall percentage, total vs completed sessions.
- `PATCH /therapy/sessions/{session_id}/schedule` — Schedule date, time, and append custom pre/post precautions.
- `PATCH /therapy/sessions/{session_id}/complete` — Mark session as completed with practitioner notes.
- `GET /therapy/plans/{plan_id}/feedback-chart` — Extract timeline data of session ratings for graphing.

### 6.6 Recovery Milestones (`/milestones`)
- `GET /milestones/plans/{plan_id}/milestones` — List recovery milestones for a plan.
- `POST /milestones/plans/{plan_id}/milestones` — Practitioner adds a target milestone to a plan.
- `PATCH /milestones/milestones/{milestone_id}/achieve` — Mark milestone as achieved.
- `DELETE /milestones/milestones/{milestone_id}` — Remove a milestone.

### 6.7 Feedback & Symptoms (`/feedback`)
- `POST /feedback/sessions/{session_id}` — Patient submits post-session rating, symptom tags, and comments.
- `GET /feedback/sessions/{session_id}` — View feedback for a specific completed session.

### 6.8 Notifications (`/notifications`)
- `GET /notifications` — Fetch all system alerts, precaution reminders, and scheduling alerts.
- `GET /notifications/unread-count` — Quick badge count of unread notifications.
- `PATCH /notifications/{id}/read` — Mark single notification as read.
- `PATCH /notifications/read-all` — Mark all user notifications as read.

### 6.9 Analytics (`/analytics`)
- `GET /analytics/practitioner` — Returns practitioner KPIs: total plans, unique patients, session completion rate, monthly distribution bar chart data, and status donut breakdown.
- `GET /analytics/patient` — Returns patient KPIs: total sessions, completion trajectory, average rating, and improvement trend curve.

---

## 7. Frontend Routing & Component Architecture

### 7.1 Page Routes (App Router)
- `/` — Premium Landing Page with statistics, feature showcase, classical Panchakarma cards, how-it-works timeline, and CTA.
- `/login` — Split authentication screen for Patients & Practitioners with Google One-Tap.
- `/register` — Dual-role registration with Zod validation, credential fields, and medical specialization inputs.
- `/panchakarma` — Fullscreen Panchakarma Reels Feed & clinical encyclopedia.
- `/notifications` — Unified notification center with unread filtering.
- **Patient Portal:**
  - `/patient/dashboard` — Overview of next session, active plan progress, quick access cards.
  - `/patient/practitioners` — Interactive City-based Doctor Directory & simulated map.
  - `/patient/therapy` — Comprehensive list of active and past Panchakarma therapy plans.
  - `/patient/therapy/[id]/sessions` — Chronological session timeline, pre/post precautions, feedback modal.
  - `/patient/requests` — Outgoing consultation request status tracker.
  - `/patient/profile` — Medical history and demographic details.
- **Practitioner Portal:**
  - `/practitioner/dashboard` — Practitioner KPI overview, today's appointments, pending requests.
  - `/practitioner/requests` — Actionable incoming patient request inbox.
  - `/practitioner/plans` — Active patient therapy plans list.
  - `/practitioner/plans/new` — Wizard for formulating new Panchakarma plans from templates.
  - `/practitioner/plans/[id]/sessions` — Session scheduler, precaution assignment, and completion logger.
  - `/practitioner/patients` — Unique patient directory under practitioner's care.
  - `/practitioner/analytics` — Interactive Recharts dashboard for clinical performance and volume.
  - `/practitioner/profile` — Practitioner bio, timings, and clinic city settings.

### 7.2 Core Component Architecture
- **`components/maps/GoogleMapsSimulator.tsx`**: Interactive Google Maps simulator with road/satellite toggle, clinic cards, distance tags, and appointment booking triggers.
- **`components/media/PanchakarmaReelsView.tsx`**: Mobile-optimized vertical video reel with volume controls, audio playback, progress indicator, and modal factsheet drawers.
- **`components/media/TherapyVideoPlayer.tsx`**: Inline video player for procedural demonstrations.
- **`components/shared/ProgressChart.tsx`**: Recharts responsive container plotting session-by-session recovery curves.
- **`components/layout/navbar.tsx`**: Responsive navigation bar with role-based links, notification badge, and logout.
- **`components/layout/bottom-nav.tsx`**: Mobile-friendly fixed bottom tab navigation for quick navigation on mobile screens.
- **`components/layout/back-button-handler.tsx`**: Native hardware back-button listener for Android Capacitor builds.
- **`components/auth/google-sign-in-button.tsx`**: Hybrid Google Sign-In supporting both Web Google OAuth and Native `@capgo/capacitor-social-login`.

---

## 8. Specialized Interactive Features

### 8.1 Panchakarma Reels View
Modeled after modern social video platforms to solve the problem of patient hesitation and unfamiliarity with procedures:
- Fullscreen vertical scrolling feed.
- High-definition procedural video playback for all 5 classical therapies.
- Factsheet Drawer detailing *Sanskrit Nomenclature*, *Dosha Impact*, *Purvakarma*, *Pradhanakarma*, and *Paschatkarma*.
- Direct action button to immediately book consultation for the viewed therapy.

### 8.2 Google Maps Simulator & Clinic Locator
Solves the Ayush problem statement requirement of connecting patients with verified practitioners:
- Pre-configured geographic clusters: **Delhi NCR**, **Punjab & Chandigarh**, **Kerala (Kochi & Trivandrum)**, and **Mumbai & Pune**.
- Interactive simulated map pins showing verified hospital locations, distance metrics, CGHS/NABH accreditation badges, and consultation fees.
- One-click trigger opening the treatment request dialogue directly for that clinic's chief Vaidya.

### 8.3 Recovery Trajectory & Feedback Visualization
Closes the loop between patient experience and clinical adjustment:
- Granular 1–5 Star Rating + 1–5 Improvement Self-Assessment.
- Structured symptom reporting (e.g., fatigue, pain reduction, appetite enhancement, lightness).
- Dynamic Recharts line and bar graphs showing progressive recovery over the therapy plan.

---

## 9. Authentication & Security Implementation

1. **Password Security:** Salted hashing powered by `passlib[bcrypt]`.
2. **Stateless JWT Authorization:** Access tokens signed with HMAC-SHA256 (`python-jose`), containing user ID, role claim, and 60-minute expiration.
3. **Role-Based Access Control (RBAC):** FastAPI dependencies `get_current_user`, `get_current_patient`, and `get_current_practitioner` guard protected routes at the controller level.
4. **Hybrid Google OAuth:**
   - On Web: Uses Google Identity Services (`@react-oauth/google`).
   - On Android: Uses `@capgo/capacitor-social-login` via Capacitor bridge.
   - Backend verifies ID tokens via `google-auth` to ensure authenticity.
5. **CORS Security:** Strictly configured origins allowing local web ports (`3000`, `5173`), local network IPs (`192.168.x.x`), and native mobile scheme (`capacitor://localhost`).

---

## 10. Environment Variables & Configuration Reference

### Backend (`ayursutra/ayursutra_backend/.env`)
```ini
# Supabase PostgreSQL Cloud Database
DB_USER=postgres
DB_PASSWORD=[YOUR_PASSWORD]
DB_HOST=db.nxyzpcrieucfvckrsayc.supabase.co
DB_PORT=5432
DB_NAME=postgres

# Supabase API Configuration
SUPABASE_URL=https://nxyzpcrieucfvckrsayc.supabase.co
SUPABASE_KEY=your_supabase_secret_key
SUPABASE_PUBLISHABLE_KEY=sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU
SUPABASE_SECRET_KEY=your_supabase_secret_key
SUPABASE_JWKS_URL=https://nxyzpcrieucfvckrsayc.supabase.co/auth/v1/.well-known/jwks.json

# Or Direct MySQL / PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.nxyzpcrieucfvckrsayc.supabase.co:5432/postgres

# Application Security
SECRET_KEY=ayursutra-secret-key-32b-secure-jwt-token-key-2024
ACCESS_TOKEN_EXPIRE_MINUTES=60
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,capacitor://localhost
```

### Frontend (`ayursutra/ayursutra_frontend/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://nxyzpcrieucfvckrsayc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID].apps.googleusercontent.com
```

### Capacitor Mobile Config (`ayursutra/ayursutra_frontend/capacitor.config.ts`)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ayursutra.app',
  appName: 'AyurSutra',
  webDir: 'out',
  server: {
    url: 'http://192.168.x.x:3000', // Dev server URL for live device debugging
    cleartext: true
  }
};

export default config;
```

---

## 11. Directory & File Tree Map

```
minorproject/
│
├── AyurSutra.apk                          # Pre-built release/debug Android APK
├── PROJECT_EVERYTHING.md                  # Master project & technical inventory
│
└── Ayursutra/
    ├── README.md                          # Quickstart guide
    ├── ps.md                              # Ministry of Ayush Problem Statement
    ├── PROJECT_EVERYTHING.md              # Master project & technical inventory (this file)
    │
    └── ayursutra/
        ├── ayursutra_backend/             # Python FastAPI Backend
        │   ├── alembic/                   # Database migration environment
        │   │   ├── versions/              # Migration revision scripts
        │   │   └── env.py
        │   ├── alembic.ini                # Alembic configuration
        │   ├── create_db.py               # Database initialization helper
        │   ├── requirements.txt           # Python dependency specifications
        │   ├── seed.py                    # Database seeding (Practitioners & Templates)
        │   ├── .env                       # Backend secrets and DB credentials
        │   └── app/
        │       ├── main.py                # FastAPI entry point & CORS configuration
        │       ├── api/                   # REST route controllers
        │       │   ├── auth.py            # Login, registration, Google auth
        │       │   ├── patients.py        # Patient profile management
        │       │   ├── practitioners.py   # Practitioner directory & profile
        │       │   ├── treatment_requests.py # Consultation request workflow
        │       │   ├── therapy.py         # Plans, sessions, progress endpoints
        │       │   ├── milestones.py      # Recovery milestones API
        │       │   ├── feedback.py        # Session ratings & symptoms
        │       │   ├── notifications.py   # In-app alerts & precautions
        │       │   └── analytics.py       # Practitioner & patient BI metrics
        │       ├── core/
        │       │   ├── config.py          # Pydantic Settings
        │       │   ├── database.py        # SQLAlchemy engine & session factory
        │       │   └── security.py        # Password hashing & JWT generation
        │       ├── dependencies/          # Dependency injection (Auth, DB session)
        │       ├── models/                # SQLAlchemy ORM database models
        │       ├── schemas/               # Pydantic request/response schemas
        │       └── services/              # Encapsulated business logic
        │
        └── ayursutra_frontend/            # Next.js 16 + React 19 Frontend
            ├── package.json               # NPM packages & project scripts
            ├── next.config.ts             # Next.js configuration (static export)
            ├── capacitor.config.ts        # Capacitor mobile app configuration
            ├── tsconfig.json              # TypeScript compiler configuration
            ├── android/                   # Native Android Studio Project
            │   ├── app/src/main/
            │   │   ├── AndroidManifest.xml # Android permissions and activities
            │   │   └── res/               # App icons and themes
            │   └── build.gradle           # Native Android Gradle configuration
            ├── app/                       # Next.js App Router (Pages & Layouts)
            │   ├── layout.tsx             # Root layout with Query & Auth Providers
            │   ├── globals.css            # Global Tailwind v4 design tokens
            │   ├── page.tsx               # Main Landing Page
            │   ├── login/                 # Login Page
            │   ├── register/              # Registration Page
            │   ├── panchakarma/           # Fullscreen Reels Page
            │   ├── notifications/         # Notification Center
            │   ├── patient/               # Patient Portal Routes
            │   └── practitioner/          # Practitioner Portal Routes
            ├── components/                # Reusable UI & Feature Components
            │   ├── auth/                  # Google sign-in button
            │   ├── layout/                # Navbar, bottom nav, back button
            │   ├── maps/                  # Google Maps Simulator component
            │   ├── media/                 # Panchakarma Reels & Video Player
            │   ├── shared/                # Progress charts & visualizers
            │   └── ui/                    # Button, Card, Badge, Input, Label
            ├── lib/
            │   ├── api/client.ts          # Central Axios instance
            │   ├── data/
            │   │   ├── panchakarma.ts     # Panchakarma clinical encyclopedia data
            │   │   └── practitionerLocations.ts # City maps & hospital data
            │   └── utils.ts               # Class merging utilities
            └── providers/                 # React Context Providers
                ├── auth-provider.tsx      # Auth session state & token handling
                ├── google-provider.tsx    # Google OAuth provider wrapper
                ├── query-provider.tsx     # TanStack Query client provider
                └── theme-provider.tsx     # Color theme manager
```

---

## 12. Local Setup, Execution & Build Instructions

### 12.1 Backend Setup
```bash
# Navigate to backend directory
cd Ayursutra/ayursutra/ayursutra_backend

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install all Python dependencies
pip install -r requirements.txt

# Run migrations (or seed directly)
alembic upgrade head
python seed.py

# Launch development API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*API Swagger Documentation will be accessible at: `http://localhost:8000/docs`*

---

### 12.2 Frontend Setup
```bash
# Navigate to frontend directory
cd Ayursutra/ayursutra/ayursutra_frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend Web application will run on `http://localhost:3000`*

---

### 12.3 Android APK Build (Capacitor)
```bash
cd Ayursutra/ayursutra/ayursutra_frontend

# Build Next.js static export
npm run build

# Synchronize web assets to the native Android directory
npx cap sync android

# Open Android Studio to build APK or run directly via Gradle
cd android
./gradlew assembleDebug
```
*The resulting APK is located at: `android/app/build/outputs/apk/debug/app-debug.apk` (and root `AyurSutra.apk`).*

---
*Created as part of the official project technical documentation for AyurSutra (Problem Statement 25023 — Ministry of Ayush).*
