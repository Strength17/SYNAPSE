import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../services/supabase.js';

const router = express.Router();

/**
 * GET /api/actions
 * Returns pending actions sorted by urgency and confidence.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*, emails(subject, sender_name)')
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .order('urgency', { ascending: false })
      .order('confidence', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

/**
 * GET /api/actions/done
 * Returns history of completed actions.
 */
router.get('/done', authenticate, async (req, res) => {
  const { period = 'all' } = req.query;
  
  try {
    let query = supabase
      .from('done_log')
      .select('*')
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false });

    if (period === 'today') {
      const today = new Date();
      today.setHours(0,0,0,0);
      query = query.gte('completed_at', today.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * POST /api/actions/:id/implement
 * Marks an action as implemented.
 */
router.post('/:id/implement', authenticate, async (req, res) => {
  try {
    // 1. Get action detail
    const { data: action, error: getErr } = await supabase
      .from('actions')
      .select('*, emails(subject)')
      .eq('id', req.params.id)
      .single();

    if (getErr || !action) return res.status(404).json({ error: 'Action not found' });

    // 2. Update status
    await supabase.from('actions').update({ status: 'implemented' }).eq('id', action.id);

    // 3. Log in done_log
    const { data: done, error: logErr } = await supabase
      .from('done_log')
      .insert({
        user_id: req.user.id,
        action_id: action.id,
        email_subject: action.emails.subject,
        action_taken: action.action_label,
        urgency: action.urgency,
        confidence: action.confidence
      })
      .select()
      .single();

    if (logErr) throw logErr;
    res.json(done);
  } catch (err) {
    res.status(500).json({ error: 'Failed to implement action' });
  }
});

/**
 * POST /api/actions/:id/dismiss
 */
router.post('/:id/dismiss', authenticate, async (req, res) => {
  try {
    await supabase.from('actions').update({ status: 'dismissed' }).eq('id', req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dismiss action' });
  }
});

export default router;
