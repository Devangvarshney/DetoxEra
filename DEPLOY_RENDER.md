# Deploying AyurSutra Backend on Render 🚀

This guide explains how to deploy the AyurSutra FastAPI backend to **Render** (free tier supported) and connect the frontend/APK.

---

## Architecture Summary
- **Backend**: Hosted on Render as a Python Web Service (`https://<your-service-name>.onrender.com`).
- **Frontend / Android APK**: Runs completely self-contained (`webDir: "out"`). No frontend server is required on your computer or hotspot anymore!
- **Communication**: Frontend and Android APK make direct HTTPS API calls to Render.

---

## Option A: 1-Click / Blueprint Deployment (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Select your AyurSutra repository.
5. Render will automatically detect [`render.yaml`](file:///e:/DetoxERA/DetoxEra/render.yaml) and configure:
   - **Service Name**: `ayursutra-backend`
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Under Environment Variables, enter your database connection string in `DATABASE_URL` (see Database Options below).
7. Click **Apply**.

---

## Option B: Manual Web Service Creation

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `ayursutra-backend` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `ayursutra/ayursutra_backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

4. Add the following **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Ensures Python 3.11 is used |
   | `SECRET_KEY` | *(Generate a 32+ character random string)* | JWT encryption key |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token validity |
   | `GOOGLE_CLIENT_ID` | `348329351587-7a722sgnm0tlcfs3gotue709jspsi3ph.apps.googleusercontent.com` | Google OAuth Client ID |
   | `CORS_ORIGINS` | `*` | Allows mobile APK and web clients |
   | `DATABASE_URL` | *(See Database Options below)* | Database connection URI |

5. Click **Create Web Service**.

---

## Database Options for Render

Because SQLite on Render's free tier is ephemeral (erased on restart/sleep), choose one of the following:

### 1. Supabase PostgreSQL (Project Ref: `nxyzpcrieucfvckrsayc`)
Use the **Supabase Connection Pooler** (Transaction Mode, Port `6543` or Session Mode, Port `5432`):
```
postgresql://postgres.nxyzpcrieucfvckrsayc:[YOUR_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```
> **How to find/reset your Supabase Database Password:**
> 1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nxyzpcrieucfvckrsayc/settings/database).
> 2. Navigate to **Project Settings** → **Database**.
> 3. Under **Database password**, click **Reset database password** if you don't remember it.
> 4. Under **Connection string** → Select **URI** and **Transaction** pooler mode (Port 6543).
> 5. Copy and paste it as the `DATABASE_URL` environment variable on Render.

### 2. Render Managed PostgreSQL (Free in 1-Click)
1. On Render Dashboard, click **New +** → **PostgreSQL**.
2. Name it `ayursutra-db` and select the Free tier.
3. Once created, copy the **Internal Database URL** (if in same region) or **External Database URL**.
4. Paste it as `DATABASE_URL` on your `ayursutra-backend` Web Service.
*(Note: SQLAlchemy automatically handles Render's `postgres://` prefix).*

### 3. Ephemeral SQLite (Zero Config for Quick Testing)
If you just want to test without setting up PostgreSQL:
```
DATABASE_URL=sqlite:///./ayursutra.db
```
The backend automatically creates all tables on startup via `startup_db_migration()`.

---

## Connecting the Frontend & Rebuilding the APK

Once your backend is live on Render (e.g. `https://ayursutra-backend.onrender.com`):

1. **Update Frontend Environment**:
   Open [`ayursutra/ayursutra_frontend/.env.local`](file:///e:/DetoxERA/DetoxEra/ayursutra/ayursutra_frontend/.env.local) and update `NEXT_PUBLIC_API_URL`:
   ```env
   NEXT_PUBLIC_API_URL=https://<your-render-service-name>.onrender.com
   ```

2. **Re-export Frontend**:
   ```bash
   cd ayursutra/ayursutra_frontend
   npm run build
   ```

3. **Sync to Capacitor**:
   ```bash
   npx cap sync android
   ```

4. **Build Android APK**:
   ```bash
   cd android
   ./gradlew.bat assembleDebug
   ```
   The APK at `AyurSutra.apk` will now connect directly to your Render cloud API with no computer or hotspot required!

---

> [!TIP]
> **Render Free Tier Spin-Down Notice**:
> Render's free tier spins down web services after 15 minutes of inactivity. When you open the app after a while, the very first API call might take 30–45 seconds while Render boots up the container. Subsequent requests will be instant.
