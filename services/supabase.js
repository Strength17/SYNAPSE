import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
console.log('DEBUG: process.env.SUPABASE_URL:', process.env.SUPABASE_URL);
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase client initialized with the SERVICE_ROLE key.
 * Used for backend-only operations that bypass Row Level Security.
 * NEVER expose this client to the frontend.
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Fetch a user profile by ID.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Object|null>}
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Upsert a user profile.
 * @param {Object} profile - Profile data object.
 * @returns {Promise<Object|null>}
 */
export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Update sync status for a user.
 * @param {string} userId - UUID of the user.
 * @param {Object} updates - { last_sync_at, sync_cursor }
 */
export async function updateSyncStatus(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating sync status:', error.message);
  }
}
