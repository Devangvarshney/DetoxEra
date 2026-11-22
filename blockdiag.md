# AyurSutra (DetoxEra) — System Architecture & Detailed Block Diagrams

AyurSutra (DetoxEra) is an enterprise-grade digital therapeutics and clinical scheduling platform engineered specifically for **Panchakarma** management under the **Ministry of Ayush** guidelines (*Problem Statement ID: 25023*). It integrates classical Ayurvedic treatment protocols with modern full-stack web and native Android engineering.

---

## 1. High-Level Multi-Tier Architectural Block Diagram

The platform follows a decoupled, cloud-ready client-server and hybrid mobile architecture across four operational tiers:

```mermaid
flowchart TD
    %% TIER 1: CLIENT PRESENTATION TIER
    subgraph TIER1["1. CLIENT PRESENTATION TIER"]
        subgraph WEB["Web Browser Client"]
            W_P["Next.js 16 App Router (React 19)"]
            W_UI["Tailwind CSS v4 + Lucide Icons"]
            W_S["Client State (@tanstack/react-query)"]
        end
        subgraph MOBILE["Mobile Android Device"]
            M_APK["AyurSutra Standalone APK"]
            M_CAP["Capacitor 8 Mobile Runtime"]
            M_NAT["Native Hardware Back & Social Login"]
        end
    end

    %% TIER 2: API GATEWAY & SECURITY TIER
    subgraph TIER2["2. API GATEWAY & SECURITY TIER"]
        GW["Uvicorn ASGI High-Performance Server"]
        CORS["CORS Middleware (FastAPI)"]
        AUTH_PIP["Security & Auth Pipeline"]
        JWT_V["JWT Bearer Token Validator (python-jose)"]
        GOOG_V["Google OAuth 2.0 Verifier (google-auth)"]
    end

    %% TIER 3: APPLICATION SERVICES & BUSINESS LOGIC TIER
    subgraph TIER3["3. APPLICATION SERVICES & BUSINESS LOGIC TIER"]
        ROUTERS["FastAPI API Routers"]
        
        subgraph MODULES["Core Business Service Engines"]
            AUTH_SVC["Auth Service (Bcrypt + RBAC)"]
            PRAC_SVC["Practitioner & Clinic Engine"]
            REQ_SVC["Treatment Request Workflow Engine"]
            PLAN_SVC["Therapy Plan & Session Scheduler"]
            PREC_SVC["Purvakarma & Paschatkarma Precaution Engine"]
            MILE_SVC["Recovery Milestone Engine"]
            FEED_SVC["Patient Symptom & Feedback Collector"]
            NOTIF_SVC["Automated Notification Dispatcher"]
            ANAL_SVC["Clinical Recovery & Volume Analytics"]
        end
        
        PYDANTIC["Pydantic v2 Schemas (Validation & Serialization)"]
        ORM["SQLAlchemy 2.0 ORM Engine"]
    end

    %% TIER 4: DATA PERSISTENCE & CLOUD SERVICES TIER
    subgraph TIER4["4. DATA PERSISTENCE & CLOUD SERVICES TIER"]
        subgraph DB["Relational Database Tier"]
            SUPA_PG["Supabase PostgreSQL 15+ (Production Cloud)"]
            MYSQL_LOCAL["Local MySQL Server 8.0+ (Fallback)"]
            ALEMBIC["Alembic Database Migration Manager"]
        end
        subgraph CLOUD["External Infrastructure & Cloud Providers"]
            RENDER["Render Cloud (FastAPI Web Service)"]
            GOOG_CLOUD["Google Cloud Platform (Identity OAuth)"]
            VERCEL["Vercel / Static Web Host ('out' distribution)"]
        end
    end

    %% CONNECTIONS
    WEB -->|"HTTPS / REST JSON"| GW
    MOBILE -->|"Capacitor Bridge / HTTPS"| GW
    GW --> CORS
    CORS --> AUTH_PIP
    AUTH_PIP --> JWT_V
    AUTH_PIP --> GOOG_V
    AUTH_PIP --> ROUTERS
    ROUTERS --> PYDANTIC
    PYDANTIC --> MODULES
    MODULES --> ORM
    ORM -->|"psycopg2-binary (SSL)"| SUPA_PG
    ORM -.->|"pymysql"| MYSQL_LOCAL
    ALEMBIC -->|"Schema Evolution"| SUPA_PG
    AUTH_SVC -.->|"Verify Token"| GOOG_CLOUD
    GW -.->|"Hosted on"| RENDER
```

---

## 2. Component & Subsystem Decomposition Block Diagram

This diagram breaks down the internal modules across Frontend, Mobile Bridge, Backend Services, and Data Schemas:

```mermaid
flowchart LR
    %% FRONTEND MODULES
    subgraph FE["Frontend Subsystem (Next.js 16)"]
        direction TB
        FE_LAND["Landing & Encyclopedia (/panchakarma)"]
        FE_AUTH["Auth System (/login, /register, Google One-Tap)"]
        
        subgraph PT_PORTAL["Patient Portal"]
            PT_DASH["Dashboard & Recovery Progress"]
            PT_DISC["Doctor Directory & Simulated Map"]
            PT_SESS["Session Timeline & Daily Precautions"]
            PT_FEED["Post-Session Feedback & Symptoms"]
        end
        
        subgraph PR_PORTAL["Practitioner Portal"]
            PR_DASH["Dashboard & Daily Schedule"]
            PR_REQ["Incoming Treatment Requests Inbox"]
            PR_PLAN["Therapy Plan Formulation Wizard"]
            PR_SCHED["Session Scheduler & Precaution Setup"]
            PR_ANAL["Recovery Trajectory Analytics (Recharts)"]
        end
        
        FE_COMP["Interactive Components"]
        FE_MAP["DoctorClinicsMapModal"]
        FE_REEL["PanchakarmaReelsView (Vertical Video)"]
    end

    %% MOBILE BRIDGE
    subgraph MOB["Capacitor 8 Android Bridge"]
        direction TB
        CAP_CONF["capacitor.config.ts"]
        AND_GRADLE["Gradle 8 + android/app/build.gradle"]
        KEYSTORE["Signing Config (debug.keystore)"]
        CAP_PLUG["Capacitor Native Plugins: App BackButton, SocialLogin"]
        APK["AyurSutra Standalone APK (79+ MB)"]
    end

    %% BACKEND SERVICES
    subgraph BE["Backend Core Subsystem (FastAPI)"]
        direction TB
        BE_MAIN["FastAPI Application (app/main.py)"]
        
        subgraph ROUTE_GRP["API Routers (app/api)"]
            R_AUTH["auth.py"]
            R_PRAC["practitioners.py"]
            R_PAT["patients.py"]
            R_REQ["treatment_requests.py"]
            R_THER["therapy.py"]
            R_MILE["milestones.py"]
            R_FEED["feedback.py"]
            R_NOTIF["notifications.py"]
            R_ANAL["analytics.py"]
        end
        
        subgraph SVC_GRP["Service Layer (app/services)"]
            S_AUTH["auth_service.py"]
            S_PRAC["practitioner_service.py"]
            S_THER["therapy_service.py"]
            S_FEED["feedback_service.py"]
            S_NOTIF["notification_service.py"]
            S_ANAL["analytics_service.py"]
        end
    end

    %% INTERCONNECTS
    FE_LAND --> FE_COMP
    FE_COMP --> FE_MAP
    FE_COMP --> FE_REEL
    FE --> MOB
    MOB --> APK
    FE -->|"REST API Calls (lib/api/client.ts)"| BE_MAIN
    BE_MAIN --> ROUTE_GRP
    ROUTE_GRP --> SVC_GRP
```

---

## 3. End-to-End Clinical Lifecycle Workflow

The sequence below illustrates the full lifecycle of a Panchakarma treatment from initial discovery to recovery milestone completion:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (Web / Mobile)
    participant Client as Frontend (Next.js / Capacitor)
    participant Gateway as FastAPI Backend Gateway
    participant Svc as Clinical & Precaution Services
    participant DB as Supabase PostgreSQL Database
    actor Doctor as Practitioner (Vaidya)

    %% Step 1: Onboarding & Discovery
    Note over Patient, Client: 1. Registration & Doctor Discovery
    Patient->>Client: Search Practitioners by City & Specialization
    Client->>Gateway: GET /practitioners?city=Delhi
    Gateway->>DB: Query Practitioners, Clinics & Reviews
    DB-->>Gateway: Return Matching Practitioners
    Gateway-->>Client: Render Interactive Doctor Cards & Map
    Client-->>Patient: View Doctor Clinic Location & Fee Details

    %% Step 2: Consultation Request
    Note over Patient, Doctor: 2. Consultation Request
    Patient->>Client: Submit Panchakarma Request (Symptoms, Target Dosha)
    Client->>Gateway: POST /treatment-requests
    Gateway->>Svc: Validate and create request
    Svc->>DB: Insert into treatment_requests (status='pending')
    Svc->>DB: Insert Notification for Doctor
    Doctor->>Client: View Incoming Requests Inbox
    Doctor->>Client: Accept Request & Open Plan Wizard
    Client->>Gateway: PATCH /treatment-requests/{id} (status='accepted')

    %% Step 3: Therapy Plan Formulation
    Note over Doctor, Svc: 3. Formulating Multi-Session Therapy Plan
    Doctor->>Client: Formulate Plan from Template (e.g., Virechana 7 Sessions)
    Client->>Gateway: POST /therapy/plans (template_id, num_sessions, duration)
    Gateway->>Svc: Auto-generate therapy_sessions (1..N) & milestones
    Svc->>DB: Persist TherapyPlan, TherapySessions, TherapyMilestones
    Doctor->>Client: Schedule Session #1 + Assign Pre/Post Precautions
    Client->>Gateway: PATCH /therapy/sessions/{id}/schedule
    Gateway->>Svc: Precaution Engine Triggers
    Svc->>DB: Save session date/time & pre_precautions (Snehana/Swedana)
    Svc->>DB: Dispatch automated precaution notification to Patient

    %% Step 4: Procedure Execution & Completion
    Note over Patient, Doctor: 4. Execution & Paschatkarma Precautions
    Patient->>Client: Reads Pre-Session Guidance (Fasting & Oleation)
    Doctor->>Client: Mark Session #1 as Completed + Clinical Observations
    Client->>Gateway: PATCH /therapy/sessions/{id}/complete
    Gateway->>Svc: Update Session Status -> completed
    Svc->>DB: Dispatch Post-Procedure Notification (Samsarjana Krama Diet)

    %% Step 5: Patient Feedback & Milestones
    Note over Patient, DB: 5. Patient Feedback, Milestones & Analytics
    Patient->>Client: Submit Post-Session Feedback (Rating 1-5, Symptom Relief)
    Client->>Gateway: POST /feedback/sessions/{id}
    Gateway->>Svc: Record Feedback & Check Milestone Thresholds
    Svc->>DB: Insert Feedback + Auto-Achieve Target Milestones
    Client->>Gateway: GET /analytics/practitioner & /analytics/patient
    Gateway->>DB: Aggregate Completion Rates & Improvement Scores
    Gateway-->>Client: Feed Recharts Recovery Curves & Analytics Dashboards
```

---

## 4. Database Entity-Relationship (ER) Architecture

The relational schema comprises **11 interconnected entities** enforcing referential integrity and cascading updates:

```mermaid
erDiagram
    USERS ||--o| PATIENTS : "1:1 profile"
    USERS ||--o| PRACTITIONERS : "1:1 profile"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    PRACTITIONERS ||--o{ PRACTITIONER_CLINICS : "operates"
    PRACTITIONERS ||--o{ PRACTITIONER_REVIEWS : "receives reviews"
    PATIENTS ||--o{ PRACTITIONER_REVIEWS : "writes"

    PATIENTS ||--o{ TREATMENT_REQUESTS : "initiates"
    PRACTITIONERS ||--o{ TREATMENT_REQUESTS : "manages"

    THERAPY_TEMPLATES ||--o{ THERAPY_PLANS : "templates"
    PATIENTS ||--o{ THERAPY_PLANS : "undergoes"
    PRACTITIONERS ||--o{ THERAPY_PLANS : "prescribes"

    THERAPY_PLANS ||--|{ THERAPY_SESSIONS : "contains 1..N"
    THERAPY_PLANS ||--o{ THERAPY_MILESTONES : "tracks"

    THERAPY_SESSIONS ||--o| FEEDBACK : "evaluates 1:1"
    PATIENTS ||--o{ FEEDBACK : "submits"
    PRACTITIONERS ||--o{ FEEDBACK : "reviewed in"

    USERS {
        int id PK
        string email UK
        string hashed_password
        string role "patient | practitioner"
        boolean is_active
        datetime created_at
    }

    PATIENTS {
        int id PK
        int user_id FK
        string name
        string phone
        int age
        string gender
        string address
        string profile_info
    }

    PRACTITIONERS {
        int id PK
        int user_id FK
        string name
        string specialization
        string qualification
        string experience
        string city
        string bio
        string availability
    }

    PRACTITIONER_CLINICS {
        int id PK
        int practitioner_id FK
        string clinic_name
        string address
        string city
        float latitude
        float longitude
        string phone
        string consultation_fee
    }

    PRACTITIONER_REVIEWS {
        int id PK
        int practitioner_id FK
        int patient_id FK
        string patient_name
        int rating
        string review
        string review_text
        string clinic_name
        datetime created_at
    }

    TREATMENT_REQUESTS {
        int id PK
        int patient_id FK
        int practitioner_id FK
        string message
        string status "pending | accepted | rejected | cancelled"
        datetime created_at
    }

    THERAPY_TEMPLATES {
        int id PK
        string name "Vamana | Virechana | Basti | Nasya | Raktamokshana"
        string description
        int recommended_session_count
        int default_session_duration
        string instructions
    }

    THERAPY_PLANS {
        int id PK
        int patient_id FK
        int practitioner_id FK
        int template_id FK
        string title
        string description
        int number_of_sessions
        int session_duration
        string notes
        datetime created_at
    }

    THERAPY_SESSIONS {
        int id PK
        int therapy_plan_id FK
        int session_number
        string status "pending | scheduled | completed | cancelled"
        date scheduled_date
        time start_time
        time end_time
        int duration
        string practitioner_notes
        string patient_notes
        string pre_precautions "Purvakarma rules"
        string post_precautions "Paschatkarma diet"
        datetime completed_at
    }

    THERAPY_MILESTONES {
        int id PK
        int therapy_plan_id FK
        string title
        string description
        int target_session
        boolean is_achieved
        datetime achieved_at
    }

    FEEDBACK {
        int id PK
        int session_id FK, UK
        int patient_id FK
        int practitioner_id FK
        int rating "1 to 5 stars"
        string comments
        string symptoms_reported
        int improvement_level "1 to 5 score"
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string type "pre_precaution | post_precaution | schedule | request"
        string title
        string message
        string related_entity_type
        int related_entity_id
        boolean is_read
        datetime created_at
    }
```

---

## 5. Mobile Hybrid Integration Architecture (Capacitor 8)

The diagram below details how the single responsive React/Next.js codebase runs as both a web portal and an offline-resilient native Android application:

```mermaid
flowchart TD
    subgraph WEB_SOURCE["Web Codebase (ayursutra_frontend)"]
        PAGES["Next.js App Router Pages ('app/')"]
        COMPONENTS["React Components & Tailwind CSS"]
        OUT_DIR["Static Export ('out/' directory via next build)"]
    end

    subgraph CAPACITOR["Capacitor Hybrid Runtime"]
        SYNC["npx cap sync android"]
        CONFIG["capacitor.config.ts (App ID, Host, Cleartext)"]
        BRIDGE["Capacitor Native Bridge"]
    end

    subgraph ANDROID["Android Project (android/)"]
        GRADLE["Gradle Build Engine (gradlew assembleDebug)"]
        MANIFEST["AndroidManifest.xml (Network & Camera Permissions)"]
        KEYSTORE["Signing Configuration (debug.keystore)"]
        WEBVIEW["Android System WebView (Chromium Runtime)"]
    end

    subgraph HARDWARE["Native Android Device APIs"]
        BACK_BTN["Hardware Back Button Listener"]
        GOOG_NATIVE["Native Google Play Services Social Sign-In"]
        LOCAL_STORE["SharedPreferences / IndexedDB Session Store"]
    end

    OUT_DIR -->|"Copied into android assets"| SYNC
    CONFIG --> SYNC
    SYNC --> ANDROID
    MANIFEST --> GRADLE
    KEYSTORE --> GRADLE
    GRADLE -->|"Outputs Binary"| APK_FILE["AyurSutra.apk (Distribution Package)"]
    
    WEBVIEW --> BRIDGE
    BRIDGE --> BACK_BTN
    BRIDGE --> GOOG_NATIVE
    BRIDGE --> LOCAL_STORE
```

---

## 6. Cloud Deployment & Production Topology

The production setup uses a distributed serverless and containerized topology for high availability and zero-maintenance operations:

```mermaid
flowchart LR
    subgraph CLIENTS["End-User Clients"]
        BROWSER["Web Browsers (Desktop & Mobile)"]
        APP["Android Mobile App (Capacitor APK)"]
    end

    subgraph EDGE["Content Delivery & Static Edge"]
        CDN["Vercel Edge Network / Static Out"]
        ASSETS["Video Feed Assets (.mp4) & Clinical Images"]
    end

    subgraph COMPUTE["Backend Compute Layer"]
        RENDER_SVC["Render Cloud Web Service (detoxera.onrender.com)"]
        UVI["Uvicorn ASGI Multi-Worker Engine"]
        F_API["FastAPI 0.100+ Application"]
    end

    subgraph AUTH_EXT["Identity Providers"]
        G_AUTH["Google Identity Services (OAuth 2.0 / OpenID Connect)"]
    end

    subgraph STORAGE["Cloud Data & Storage Layer"]
        PG_CLOUD["Supabase PostgreSQL (db.nxyzpcrieucfvckrsayc.supabase.co:5432)"]
        CONN_POOL["Connection Pool (psycopg2 with SSL)"]
    end

    BROWSER -->|"HTTPS"| CDN
    APP -->|"Native HTTP"| RENDER_SVC
    CDN -->|"Fetches Dynamic Data"| RENDER_SVC
    RENDER_SVC --> UVI
    UVI --> F_API
    F_API -->|"Verify Tokens"| G_AUTH
    F_API --> CONN_POOL
    CONN_POOL --> PG_CLOUD
```

---

## 7. Key System Metrics & Specifications

| Component | Specification | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js `16.3.5` + React `19.2.8` | App Router, Server/Client components, Static export (`out`) |
| **Mobile Runtime** | Capacitor `8.5.2` | Android SDK, native plugins, signed debug keystore |
| **Backend Framework** | FastAPI + Uvicorn | Python 3.9+, ASGI async pipeline, automatic OpenAPI Swagger docs |
| **ORM & Migrations** | SQLAlchemy `2.0+` + Alembic | Declarative base, relationship cascades, auto-migration scripts |
| **Database** | PostgreSQL 15+ (Supabase) | Cloud-hosted with SSL; local MySQL fallback available |
| **Security & Auth** | JWT + Bcrypt + Google OAuth 2.0 | Dual-token verification supporting web and mobile client IDs |
| **Clinical Protocols** | Charaka & Sushruta Samhita | Classical Vamana, Virechana, Basti, Nasya, Raktamokshana rules |
