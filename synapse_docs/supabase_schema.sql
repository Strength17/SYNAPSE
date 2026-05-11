-- ─────────────────────────────────────────────────────────────────────────────
-- Synapse v2.0 — Supabase Schema
-- Run this entire file in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════
-- PROFILES — extends auth.users
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  avatar_url          TEXT,
  access_token_enc    TEXT,
  refresh_token_enc   TEXT,
  token_iv            TEXT,
  token_tag           TEXT,
  token_expires_at    TIMESTAMPTZ,
  last_sync_at        TIMESTAMPTZ,
  sync_cursor         TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  settings            JSONB NOT NULL DEFAULT '{
    "syncInterval": 60,
    "autoImplement": true,
    "notifyHigh": true,
    "demoMode": false
  }',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- EMAILS
-- All emails fetched from the user's real inbox.
-- body_html and body_text stored for AI processing.
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS emails (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_email_id   TEXT NOT NULL,                  -- Gmail messageId or Outlook id
  subject             TEXT NOT NULL DEFAULT '(no subject)',
  sender_name         TEXT NOT NULL DEFAULT '',
  sender_email        TEXT NOT NULL DEFAULT '',
  recipient_email     TEXT,
  preview             TEXT,                           -- first 200 chars of body
  body_text           TEXT,                           -- plain text body
  body_html           TEXT,                           -- HTML body (stripped client-side)
  received_at         TIMESTAMPTZ NOT NULL,
  is_read             BOOLEAN NOT NULL DEFAULT false,
  is_processed        BOOLEAN NOT NULL DEFAULT false, -- has AI processed this?
  is_dismissed        BOOLEAN NOT NULL DEFAULT false,
  -- AI classification results
  type                TEXT CHECK (type IN ('meeting', 'urgent', 'deadline', 'followup', 'info', 'unknown')),
  urgency             TEXT CHECK (urgency IN ('High', 'Normal', 'Low')) DEFAULT 'Normal',
  ai_summary          TEXT,                           -- 1-2 sentence Claude summary
  reply_draft         TEXT,                           -- Claude-generated reply draft
  classification_meta JSONB DEFAULT '{}',             -- raw classifier output
  raw_labels          JSONB DEFAULT '[]',             -- Gmail labels or Outlook categories
  thread_id           TEXT,                           -- for threading future feature
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider_email_id)
);

CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_received ON emails(user_id, received_at DESC);
CREATE INDEX idx_emails_type ON emails(user_id, type);
CREATE INDEX idx_emails_unprocessed ON emails(user_id, is_processed) WHERE is_processed = false;

-- ══════════════════════════════════════════════════════════════
-- ACTIONS
-- AI-generated actions linked to emails.
-- status: pending → implemented | dismissed | snoozed
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS actions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_id            UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  detected            TEXT NOT NULL,                  -- "Project Launch Sync"
  action_label        TEXT NOT NULL,                  -- "Schedule Meeting"
  time_text           TEXT,                           -- "Tomorrow at 10:00 AM"
  location_text       TEXT,                           -- "Conference Room B"
  urgency             TEXT NOT NULL CHECK (urgency IN ('High', 'Normal', 'Low')) DEFAULT 'Normal',
  confidence          FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'implemented', 'dismissed', 'snoozed')),
  impl                JSONB NOT NULL DEFAULT '[]',    -- [{badge, label, source}]
  snoozed_until       TIMESTAMPTZ,
  display_order       INTEGER DEFAULT 0,              -- for manual reordering
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_actions_user_pending ON actions(user_id, status) WHERE status = 'pending';
CREATE INDEX idx_actions_email ON actions(email_id);
CREATE INDEX idx_actions_urgency ON actions(user_id, urgency, created_at DESC);

-- ══════════════════════════════════════════════════════════════
-- DONE_LOG
-- Immutable history of completed actions.
-- undone_at is set when user taps Undo within 30 seconds.
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS done_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_id           UUID REFERENCES actions(id) ON DELETE SET NULL,
  email_subject       TEXT NOT NULL,
  action_taken        TEXT NOT NULL,
  urgency             TEXT,
  confidence          FLOAT,
  completed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  undone_at           TIMESTAMPTZ                     -- null = not undone
);

CREATE INDEX idx_done_user ON done_log(user_id, completed_at DESC);

-- ══════════════════════════════════════════════════════════════
-- SESSION_BLACKLIST
-- JWTs invalidated at logout. Checked by auth middleware.
-- Clean up tokens older than 7d with a scheduled job.
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS session_blacklist (
  jti         TEXT PRIMARY KEY,                       -- JWT ID claim
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blacklist_expires ON session_blacklist(expires_at);

-- ══════════════════════════════════════════════════════════════
-- TRIGGERS — auto-update updated_at
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_actions_updated
  BEFORE UPDATE ON actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- CLEANUP FUNCTION — call periodically or via pg_cron
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM session_blacklist WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════
-- NOTE ON ROW LEVEL SECURITY
-- The backend uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- Application-level auth (JWT middleware) enforces user isolation.
-- If you want extra DB-level protection, enable RLS and add:
--   ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "user_isolation" ON emails
--     USING (user_id = current_setting('app.current_user_id')::uuid);
-- Then set: SET LOCAL app.current_user_id = '<uuid>' in each query.
-- For MVP: service role + app-level auth is sufficient.
-- ══════════════════════════════════════════════════════════════
