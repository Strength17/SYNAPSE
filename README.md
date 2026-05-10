# Synapse v2.0 — AI Email Intelligence Platform

Autonomous AI email action engine. Connect your inbox, let Claude AI handle the noise, and take action with a single tap.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- Supabase account
- Anthropic API key (Claude)
- Google Cloud Console account (for Gmail)
- Azure Portal account (for Outlook)

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in the required keys. See the **Environment Setup Guide** below for details.

### 3. Database Setup
Run the SQL provided in `synapse_docs/supabase_schema.sql` in your Supabase SQL Editor.

### 4. Installation
```bash
npm install
```

### 5. Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Setup Guide

### 1. Supabase
- URL & Keys: Project Settings → API
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Secret)

### 2. Anthropic (Claude AI)
- `ANTHROPIC_API_KEY` (from console.anthropic.com)

### 3. Secrets Generation
Generate random 64-character hex strings for:
- `JWT_SECRET`
- `ENCRYPTION_KEY`

### 4. OAuth Configuration

#### Google (Gmail)
- Google Cloud Console → APIs & Services → Credentials
- Create OAuth 2.0 Client ID (Web Application)
- Redirect URI: `http://localhost:3000/api/auth/google/callback`
- Enable: **Gmail API**

#### Microsoft (Outlook)
- Azure Portal → App Registrations
- Redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
- API Permissions: `Mail.Read`, `Mail.ReadWrite`, `User.Read` (Grant Admin Consent)

---

## 🚢 Deployment

### Railway
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Deploy: `railway up`

Ensure you update your OAuth Redirect URIs in Google/Microsoft consoles to match your production Railway domain.

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude (Haiku/Sonnet)
- **Frontend**: Vanilla JS (ES Modules), CSS Custom Properties
- **Deployment**: Railway
