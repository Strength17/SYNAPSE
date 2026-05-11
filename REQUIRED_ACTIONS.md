# REQUIRED_ACTIONS.md

This file tracks actions you need to perform in external dashboards (Supabase, Google, Microsoft, Anthropic, etc.) to enable the functionality I am building.

---

## 🟢 1. SUPABASE SETUP
**Status: IN PROGRESS**

1.  Log in to your [Supabase Dashboard](https://app.supabase.com/).
2.  Select your project.
3.  Click on the **SQL Editor** icon in the left-hand sidebar.
4.  Click **+ New Query**.
5.  Open the file `synapse_docs/supabase_schema.sql` in your code editor.
6.  Copy the entire contents of that file.
7.  Paste the contents into the Supabase SQL Editor.
8.  Click the **Run** button at the bottom right.

### ⚠️ URGENT: Fix .env Keys
Your current `.env` has an error:
- `SUPABASE_SERVICE_ROLE_KEY` is set to a `postgresql://` connection string. This is **incorrect**. 
- It MUST be the **Service Role JWT** found in your Supabase Dashboard under **Settings > API**. It usually starts with `eyJ...`.
- Please update your `.env` with the correct JWT.

---

## 🟢 2. GOOGLE OAUTH SETUP (GMAIL)
**Status: PENDING**

1.  Go to [Google Cloud Console](https://console.cloud.google.com).
2.  Create a **New Project** (or select existing).
3.  Go to **APIs & Services > Library** and enable **Gmail API**.
4.  Go to **APIs & Services > OAuth consent screen**.
    - User Type: External.
    - Scopes: `https://www.googleapis.com/auth/gmail.readonly`.
5.  Go to **APIs & Services > Credentials**.
    - Click **+ Create Credentials > OAuth client ID**.
    - Application type: **Web application**.
    - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`.
6.  Copy the **Client ID** and **Client Secret** into your `.env`.

---

## 🟢 3. MICROSOFT OAUTH SETUP (OUTLOOK)
**Status: PENDING**

1.  Go to [Azure Portal > App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps).
2.  Click **+ New registration**.
    - Redirect URI: `Web` | `http://localhost:3000/api/auth/microsoft/callback`.
3.  Go to **Certificates & secrets > New client secret**.
    - Copy the secret **Value** (not ID) immediately into your `.env`.
4.  Go to **API permissions > Add a permission > Microsoft Graph > Delegated permissions**.
    - Add: `Mail.Read`, `User.Read`.
    - Click **Grant admin consent for [Your Org]**.
5.  Copy the **Application (client) ID** and **Directory (tenant) ID** into your `.env`.

---

## 🟢 4. ANTHROPIC API KEY (CLAUDE)
**Status: PENDING**

1.  Go to [Anthropic Console](https://console.anthropic.com/).
2.  Get your API key and add it to `ANTHROPIC_API_KEY` in `.env`.

---

## 🟢 4. LOCAL SECRETS
**Status: PENDING**

1.  Generate a random 128-character hex string for `JWT_SECRET`.
2.  Generate a random 64-character hex string for `ENCRYPTION_KEY`.
    - You can use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
