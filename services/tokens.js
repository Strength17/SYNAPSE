import { supabase } from './supabase.js';
import { decrypt } from './crypto.js';
import { google } from 'googleapis';
import * as msal from '@azure/msal-node';
import dotenv from 'dotenv';

dotenv.config();

// 🟢 MICROSOFT CONFIG
const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || 'common'}`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  }
};
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Ensures a user's OAuth tokens are valid, refreshing them if necessary.
 * @param {string} userId - UUID of the profile
 * @returns {Promise<string>} - A valid access token
 */
export async function getValidToken(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) throw new Error('Profile not found');

  const now = new Date();
  const expiresAt = new Date(profile.token_expires_at);

  // If token is still valid (with 5-minute buffer), return it
  if (expiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
    return decrypt(profile.access_token_enc, profile.token_iv, profile.token_tag);
  }

  // Token expired, need to refresh
  return profile.provider === 'google' 
    ? refreshGoogleToken(profile) 
    : refreshMicrosoftToken(profile);
}

/**
 * Refreshes Google OAuth token
 */
async function refreshGoogleToken(profile) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const refreshToken = decrypt(profile.refresh_token_enc, profile.token_iv, profile.token_tag);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();
  
  // Encrypt and update
  // Note: GCM Tag for access token will change, so we update the profile record
  // We'll use a new IV/Tag pair for the fresh token
  // ... implementation simplified for brevity in this task ...
  // Full logic included in P-02-T05
  return credentials.access_token;
}

/**
 * Refreshes Microsoft OAuth token using MSAL
 */
async function refreshMicrosoftToken(profile) {
  // MSAL-node handles silent token acquisition via cache
  // In a distributed environment, we'd use the refresh_token from the DB
  // ... implementation included in P-02-T05
  return 'ms_token_placeholder';
}
