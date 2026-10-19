# AyurSutra (DetoxEra) 🌿
### Panchakarma Patient Management & Automated Therapy Scheduling Platform

AyurSutra (DetoxEra) is a full-stack digital therapeutics platform designed to modernize Panchakarma management. It bridges classical Ayurvedic authenticity with modern clinical engineering, featuring automated multi-session scheduling, strict preparatory (*Purvakarma*) and recovery (*Paschatkarma*) precaution engines, dynamic recovery analytics, interactive clinic discovery maps, and cross-platform access via Web and Android.

---

## 📱 Mobile App (Android APK)

The repository includes a ready-to-install Android APK: **[`AyurSutra.apk`](./AyurSutra.apk)**.

### 📲 Step-by-Step: How to Install the APK on Your Android Device

1. **Transfer or Download the APK to your Phone**:
   - **Option A (Direct Download):** Download [`AyurSutra.apk`](./AyurSutra.apk) directly from this repository onto your Android device.
   - **Option B (USB Transfer):** Connect your phone to your PC via USB and copy `AyurSutra.apk` into your phone's **Downloads** folder.
   - **Option C (Cloud / Messaging):** Send the APK to your phone via Google Drive, Telegram, or WhatsApp Web.

2. **Allow Installation from Unknown Sources**:
   - Open your phone's **File Manager** (or Downloads folder) and tap on **`AyurSutra.apk`**.
   - If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*:
     1. Tap **Settings** in the dialog.
     2. Toggle ON **"Allow from this source"**.
     3. (On MIUI/HyperOS/Samsung, wait for the countdown, check the confirmation box, and tap **OK**).

3. **Install & Launch**:
   - Tap **Install**.
   - Once installation completes, tap **Open** to launch the AyurSutra app.

---

## ⚙️ How to Change the IP Address for Running Local APK

When developing locally, the Android APK connects to your development computer running the Next.js frontend (port `3000`) and the FastAPI backend (port `8000`). Follow these steps to point the APK to your local machine:

### Step 1: Ensure Same Wi-Fi Network
- Connect both your **Android device** and your **PC** to the **same Wi-Fi router / network** (or connect your PC to your phone's Wi-Fi hotspot).

### Step 2: Find Your PC's Local IPv4 Address
1. Open PowerShell or Command Prompt on your computer:
   ```powershell
   ipconfig
   ```
2. Look for your active adapter (Wi-Fi or Ethernet) and note your **IPv4 Address**:
   ```text
   IPv4 Address. . . . . . . . . . . : 192.168.1.50   <--- (Example IP)
   ```

### Step 3: Update the IP in Configuration Files

#### 1. Update Capacitor Configuration (`ayursutra/ayursutra_frontend/capacitor.config.ts`):
Open `ayursutra/ayursutra_frontend/capacitor.config.ts` and set your IP:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ayursutra.app',
  appName: 'AyurSutra',
  webDir: 'out',
  server: {
    url: 'http://<YOUR_LOCAL_IP>:3000', // e.g. 'http://192.168.1.50:3000'
    cleartext: true
  }
};

export default config;
```

#### 2. Update Next.js Allowed Origins (`ayursutra/ayursutra_frontend/next.config.ts`):
Add your IP to `allowedDevOrigins`:
```typescript
allowedDevOrigins: [
  "localhost",
  "localhost:3000",
  "127.0.0.1",
  "127.0.0.1:3000",
  "<YOUR_LOCAL_IP>",        // e.g. "192.168.1.50"
  "<YOUR_LOCAL_IP>:3000",   // e.g. "192.168.1.50:3000"
],
```

#### 3. Update Frontend API Client (`ayursutra/ayursutra_frontend/.env.local` or `lib/api/client.ts`):
Ensure the frontend makes API calls to your PC's IP instead of localhost (since `localhost` inside the mobile app refers to the phone itself):
```env
NEXT_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000
```
Or in `ayursutra/ayursutra_frontend/lib/api/client.ts`:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://<YOUR_LOCAL_IP>:8000";
```

#### 4. Update Backend CORS (`ayursutra/ayursutra_backend/app/core/config.py`):
Ensure your PC's IP and port are included in `CORS_ORIGINS`:
```python
CORS_ORIGINS: str = "http://localhost:3000,http://<YOUR_LOCAL_IP>:3000,capacitor://localhost,http://localhost"
```

### Step 4: Sync & Rebuild Android Project
Whenever you change `capacitor.config.ts`:
```bash
cd ayursutra/ayursutra_frontend

# 1. Sync config with the native Android project
npx cap sync android

# 2. Build the updated APK via Gradle
cd android
./gradlew assembleDebug
```
The new APK will be generated at:
`ayursutra/ayursutra_frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5: Start Dev Servers (Listening on All Network Interfaces)

1. **Start Backend (FastAPI):**
   ```bash
   cd ayursutra/ayursutra_backend
   # Activate venv
   venv\Scripts\activate
   # Launch on 0.0.0.0 to accept network connections
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend (Next.js):**
   ```bash
   cd ayursutra/ayursutra_frontend
   # Bind to 0.0.0.0 so phone can reach port 3000
   npm run dev -- -H 0.0.0.0 -p 3000
   ```

> **Firewall Note:** If the app cannot connect, temporarily allow ports `3000` and `8000` through Windows Defender Firewall for Private Networks.

---

## 🛠️ Complete Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Web Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Mobile Hybrid** | Capacitor 8, Android SDK, Gradle |
| **Backend API** | Python, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | Supabase PostgreSQL / MySQL, SQLAlchemy 2.0, Alembic |
| **Authentication** | JWT (JSON Web Tokens), BCrypt Password Hashing, Google OAuth 2.0 |
| **Clinical Protocols** | Vamana, Virechana, Basti, Nasya, Raktamokshana protocols & precautions |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.10+
- **Android Studio & SDK**: (Optional, only needed to rebuild APK)

### 2. Backend Setup
```bash
cd ayursutra/ayursutra_backend

# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # On Linux/macOS: source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables in .env
# (DATABASE_URL, JWT_SECRET_KEY, etc.)

# 4. Run migrations & database seed
alembic upgrade head
python seed.py

# 5. Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd ayursutra/ayursutra_frontend

# 1. Install packages
npm install

# 2. Run Next.js dev server
npm run dev
```
Web app runs on `http://localhost:3000`

---

## 📂 Project Structure

```text
DetoxEra / AyurSutra
├── AyurSutra.apk                           # Ready-to-install Android APK
├── PROJECT_EVERYTHING.md                   # Complete Master Technical Specification
├── README.md                               # Setup, APK installation & configuration guide
└── ayursutra/
    ├── ayursutra_backend/                  # FastAPI REST API Backend
    │   ├── app/
    │   │   ├── api/                        # API route handlers (auth, therapy, practitioners, etc.)
    │   │   ├── core/                       # App settings, security, CORS
    │   │   ├── models/                     # SQLAlchemy ORM models
    │   │   ├── schemas/                    # Pydantic request/response schemas
    │   │   └── services/                   # Business logic layer
    │   ├── alembic/                        # DB schema migrations
    │   └── requirements.txt                # Python dependencies
    │
    └── ayursutra_frontend/                 # Next.js 16 + React 19 Frontend
        ├── android/                        # Capacitor Android native project & Gradle build
        ├── app/                            # Next.js App Router (patient, practitioner, panchakarma)
        ├── components/                     # UI components, layout, maps, media player
        ├── lib/                            # API client, data helpers, utilities
        ├── public/                         # Static assets, therapy videos & images
        ├── capacitor.config.ts             # Mobile runtime & IP configuration
        └── package.json                    # Node dependencies & scripts
```

---

## 📄 License
This project was developed for the Ministry of Ayush Problem Statement 25023 (AyurSutra / DetoxEra). All rights reserved.
