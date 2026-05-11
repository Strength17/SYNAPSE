import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';
import { fetchEmails as fetchGmail } from '../services/gmail.js';

const router = express.Router();

/**
 * GET /api/emails
 * Returns paginated and filterable emails from Supabase.
 */
router.get('/', authenticate, async (req, res) => {
  const { type, search, page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('emails')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .eq('is_dismissed', false)
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,sender_name.ilike.%${search}%,body_text.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({ emails: data, total: count });
  } catch (err) {
    console.error('Fetch Emails Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

/**
 * GET /api/emails/:id
 * Returns a single email with full body.
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email detail' });
  }
});

/**
 * POST /api/emails/sync
 * Triggers a manual sync with Gmail/Outlook.
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    const fetchFunc = req.user.provider === 'google' ? fetchGmail : fetchOutlook;
    const rawEmails = await fetchFunc(req.user.id);

    // Filter out emails we already have and prepare for upsert
    const normalized = rawEmails.map(e => ({
      ...e,
      user_id: req.user.id
    }));

    const { data, error } = await supabase
      .from('emails')
      .upsert(normalized, { onConflict: 'user_id,provider_email_id' })
      .select('id');

    if (error) throw error;

    // Update last_sync_at
    await supabase.from('profiles').update({ last_sync_at: new Date().toISOString() }).eq('id', req.user.id);

    res.json({ success: true, synced: data.length });
  } catch (err) {
    console.error('Sync Error:', err.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * DELETE /api/emails/:id
 * Dismisses an email.
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('emails')
      .update({ is_dismissed: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to dismiss email' });
  }
});

export default router;
