import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = express.Router();

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile and connection status.
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email, provider, display_name, avatar_url, last_sync_at, is_active, settings')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Profile Fetch Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/user/settings
 * Updates user settings (sync interval, auto-implement, etc.)
 */
router.put('/settings', authenticate, async (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings object' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('id', req.user.id)
      .select('settings')
      .single();

    if (error) throw error;

    res.json({ success: true, settings: data.settings });
  } catch (err) {
    console.error('Settings Update Error:', err.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
