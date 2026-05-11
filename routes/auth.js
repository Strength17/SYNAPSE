import express from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase.js';
import { encrypt } from '../services/crypto.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// 🟢 GOOGLE CONFIG
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_WEB_CLIENT_ID,
  process.env.GOOGLE_WEB_CLIENT_SECRETE,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.get('/google', (req, res) => {
  const state = uuidv4();
  res.cookie('oauth_state', state, { httpOnly: true, maxAge: 600000 });
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly'],
    state
  });
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!state || state !== req.cookies.oauth_state) return res.status(403).send('Invalid state');
  res.clearCookie('oauth_state');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    oauth2Client.setCredentials(tokens);
    const { data: profile } = await oauth2.userinfo.get();

    const { iv, ciphertext: accessEnc, tag } = encrypt(tokens.access_token);
    const { ciphertext: refreshEnc } = tokens.refresh_token ? encrypt(tokens.refresh_token) : { ciphertext: null };

    const { data: user, error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        email: profile.email,
        provider: 'google',
        display_name: profile.name,
        avatar_url: profile.picture,
        access_token_enc: accessEnc,
        refresh_token_enc: refreshEnc,
        token_iv: iv,
        token_tag: tag,
        token_expires_at: new Date(tokens.expiry_date).toISOString(),
      }, { onConflict: 'email' })
      .select().single();

    if (dbError) throw dbError;
    issueToken(res, user, 'google');
  } catch (err) {
    res.status(500).send('Google Auth Failed');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function issueToken(res, user, provider) {
  const jti = uuidv4();
  const token = jwt.sign(
    { sub: user.id, email: user.email, provider, jti },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie('synapse_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.redirect(`${process.env.FRONTEND_URL}/#loading`);
}

/**
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  const token = req.cookies.synapse_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  const token = req.cookies.synapse_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await supabase.from('session_blacklist').insert({
        jti: decoded.jti,
        user_id: decoded.sub,
        expires_at: new Date(decoded.exp * 1000).toISOString()
      });
    } catch (e) {}
  }
  res.clearCookie('synapse_token');
  res.json({ success: true });
});

export default router;
