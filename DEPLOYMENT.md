# 🚀 Pilot — Deployment Guide

This guide provides step-by-step instructions to deploy the **Pilot** platform (Next.js Frontend + Express/TypeScript Backend + MongoDB Atlas + Firebase Auth) to production.

---

## 🏗️ Architecture Overview

| Component | Recommended Host | Runtime / Framework |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Next.js 16 (Turbopack, React 19) |
| **Backend** | [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io) | Node.js 20+ / Express with TypeScript |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud MongoDB Cluster |
| **Authentication** | [Firebase Auth](https://firebase.google.com/) | Google OAuth & Email/Password |
| **AI LLM** | [Google AI Studio](https://aistudio.google.com/) | Gemini 3.5 Flash |

---

> [!CAUTION]
> **⚠️ CRITICAL: MongoDB Atlas IP Whitelist — Do this FIRST or deployment WILL fail.**
>
> Cloud platforms like Render use **dynamic IPs** that change on every deploy. You must allow all IPs in Atlas:
> 1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → your cluster → **Network Access** (left sidebar)
> 2. Click **"+ ADD IP ADDRESS"** → **"ALLOW ACCESS FROM ANYWHERE"** → fills in `0.0.0.0/0`
> 3. Click **Confirm** and wait ~1 minute
>
> Without this step, you will see: `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`

---

## 📋 Prerequisites & Service Setup

Before deploying, collect your API keys and credentials:

1. **MongoDB Atlas**:
   - Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
   - **Whitelist `0.0.0.0/0`** — required for cloud-hosted backends (Render, Railway, Fly.io all use dynamic IPs). See the caution box above.
   - Create a database user with read/write access.
   - Get the connection string: `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/pilot?retryWrites=true&w=majority`

2. **Google Gemini API**:
   - Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

3. **Firebase Authentication**:
   - Create a project in [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** -> Sign-in methods: **Email/Password** and **Google**.
   - Create a Web App to get your Firebase SDK credentials (`apiKey`, `authDomain`, `projectId`, etc.).

4. **Firecrawl API (Optional)**:
   - Obtain a key from [firecrawl.dev](https://firecrawl.dev) for web crawling (or rely on native scraper fallback).

---

## 1️⃣ Deploying the Backend (Render / Railway)

### Option A: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Web Service**.
2. Connect your GitHub repository (`py-kalki/Pivot`).
3. Configure the service settings:
   - **Name**: `pilot-backend`
   - **Region**: Closest to your users (e.g., Oregon, Frankfurt, Singapore)
   - **Root Directory**: `Backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `PORT` | `4000` | Or leave default |
   | `NODE_ENV` | `production` | Production mode |
   | `FRONTEND_URL` | `https://app.usepilot.cfd` | Comma-separated list of allowed browser origins. See §3B. |
   | `MONGODB_URI` | `mongodb+srv://...` | From MongoDB Atlas |
   | `GEMINI_API_KEY` | `your_gemini_key` | From Google AI Studio |
   | `FIRECRAWL_API_KEY` | `your_firecrawl_key` | Optional |
5. Click **Create Web Service**.
6. Copy your backend live URL (e.g., `https://pilot-backend-xxxx.onrender.com`).

---

## 2️⃣ Deploying the Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New...** -> **Project**.
2. Import your GitHub repository (`py-kalki/Pivot`).
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `Frontend/pilot-frontend`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `your_firebase_api_key` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your_project.firebaseapp.com` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your_project_id` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your_project.firebasestorage.app` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `your_sender_id` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `your_app_id` |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `your_measurement_id` |
5. Click **Deploy**.
6. Copy your live frontend domain (e.g., `https://pilot.vercel.app` or custom domain `https://usepilot.cfd`).

---

## 3️⃣ Post-Deployment Configuration

### A. Authorize Frontend Domain in Firebase
To allow Google Sign-In and email authentication from your live frontend:
1. In [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Settings** -> **Authorized domains**.
2. Click **Add domain**.
3. Add your Vercel domain (e.g. `pilot.vercel.app`) and any custom domain (e.g. `usepilot.cfd`).

### B. Configure CORS on Backend (if custom domain used)
The Express backend (`Backend/src/server.ts`) builds its origin allowlist from `FRONTEND_URL` — a **comma-separated** list — plus the built-in defaults (`localhost:3000`, `localhost:3001`, `app.usepilot.cfd`, `usepilot.cfd`):

```
FRONTEND_URL=https://app.usepilot.cfd,https://pilot.vercel.app
```

> [!CAUTION]
> A missing or stale `FRONTEND_URL` on the backend host is **silent and total**: the browser gets no `Access-Control-Allow-Origin`, so *every* API call — login redirect, interview list, kit generation, resume upload — fails with the generic `Failed to fetch`, even though the server itself is up and `/health` returns 200. Rejected origins are logged as `[cors] Blocked origin: <origin>`; check the Render logs first when the UI cannot reach the API.

---

## 4️⃣ Self-Hosted Docker Deployment (Alternative)

If you prefer running on a single VPS or server:

```bash
# 1. Clone repository on server
git clone https://github.com/py-kalki/Pivot.git
cd Pivot

# 2. Configure Backend .env
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your keys

# 3. Start MongoDB and Backend via Docker
cd Backend
docker-compose up -d

# 4. Build and run Frontend with PM2 or Docker
cd ../Frontend/pilot-frontend
npm install
npm run build
npm start
```

---

## ✅ Deployment Checklist & Verification

- [ ] **Database Connection**: Backend logs show `✓ MongoDB connected successfully`.
- [ ] **Authentication**: User registration and Google OAuth work on the live frontend.
- [ ] **Background ATS Upload**: Resume upload on `/onboarding` extracts work history and skills without blocking.
- [ ] **Kit Generation**: Submitting a job description generates all sections (Company Brief, Requirements, Questions, Flashcards, Schedule).
- [ ] **Active Recall Practice**: Flashcards flip smoothly and confidence ratings save to MongoDB.
- [ ] **Custom Cursor**: macOS pointer cursor is visible across clickable items.
