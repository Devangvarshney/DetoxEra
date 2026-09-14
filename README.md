# AyurSutra: Panchakarma Patient Management & Therapy Scheduling

AyurSutra is a comprehensive digital platform designed to modernize the management of Panchakarma therapies. Built with a focus on preserving traditional authenticity while maximizing operational efficiency, the software bridges the gap between Ayurvedic practitioners and their patients.

## 🌟 Key Features

- **Automated Therapy Scheduling:** Intelligent session generation and conflict-free calendar management for practitioners.
- **Panchakarma Protocol Integration:** Built-in tracking for classical therapies (Vamana, Virechana, Basti, Nasya, Raktamokshana).
- **Pre & Post-Procedure Automation:** Practitioners can append custom precautions (e.g., fasting requirements) that automatically generate in-app alerts for the patient.
- **Real-Time Therapy Tracking:** Dynamic dashboards for patients to monitor their overall progress, completed sessions, and upcoming appointments.
- **Feedback & Visualization:** Integrated post-session feedback loops plotted on interactive graphs to visualize patient satisfaction and recovery trajectories.
- **Gated Communication:** Secure, context-aware chat functionality that unlocks only during active treatment phases.

## 🛠️ Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React.js & TypeScript
- Tailwind CSS & Shadcn UI
- React Query (Data Fetching & Polling)
- Recharts (Data Visualization)

**Backend:**
- FastAPI (Python)
- MySQL & SQLAlchemy (ORM)
- Alembic (Database Migrations)
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MySQL Server

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd ayursutra/ayursutra_backend
python -m venv venv
source venv/Scripts/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Set up your `.env` file with your database credentials:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/ayursutra
JWT_SECRET_KEY=your_secret_key
```

Run database migrations and start the server:
```bash
alembic upgrade head
uvicorn app.main:app --reload
```
*The backend API will run on http://localhost:8000*

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ayursutra/ayursutra_frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
*The web application will run on http://localhost:3000*




