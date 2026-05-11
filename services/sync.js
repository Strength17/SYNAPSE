import { supabase } from './supabase.js';
import { fetchEmails as fetchGmail } from './gmail.js';
import { classify } from '../engine/classifier.js';
import { buildAction } from '../engine/actions.js';
import { broadcast } from '../routes/stream.js';

const syncIntervals = new Map();

/**
 * Starts a background sync loop for a specific user.
 * @param {string} userId - UUID of the profile.
 * @param {number} intervalSeconds - How often to sync.
 */
export function startSyncLoop(userId, intervalSeconds = 60) {
  if (syncIntervals.has(userId)) return;

  const interval = setInterval(async () => {
    try {
      await performSync(userId);
    } catch (err) {
      console.error(`Sync loop error for user ${userId}:`, err.message);
    }
  }, intervalSeconds * 1000);

  syncIntervals.set(userId, interval);
}

/**
 * Stops the sync loop for a user.
 */
export function stopSyncLoop(userId) {
  const interval = syncIntervals.get(userId);
  if (interval) {
    clearInterval(interval);
    syncIntervals.delete(userId);
  }
}

/**
 * Performs a single sync operation.
 */
async function performSync(userId) {
  // 1. Get profile and provider
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile) return;

  broadcast(userId, 'sync_start', {});

  // 2. Fetch new emails
  const fetchFunc = profile.provider === 'google' ? fetchGmail : fetchOutlook;
  const rawEmails = await fetchFunc(userId);

  let newCount = 0;
  for (const raw of rawEmails) {
    // 3. Upsert email
    const { data: email, error: eErr } = await supabase
      .from('emails')
      .upsert({ ...raw, user_id: userId }, { onConflict: 'user_id,provider_email_id' })
      .select()
      .single();

    if (eErr || !email) continue;

    // 4. If new or unprocessed, classify
    if (!email.is_processed) {
      const classification = await classify(email);
      
      // Update email with results
      await supabase.from('emails').update({
        is_processed: true,
        type: classification.type,
        ai_summary: classification.ai_summary,
        classification_meta: classification
      }).eq('id', email.id);

      broadcast(userId, 'email', { ...email, ...classification });

      // 5. Build and store action
      const actionData = buildAction(email.id, userId, classification);
      const { data: action } = await supabase.from('actions').insert(actionData).select().single();
      
      if (action) {
        broadcast(userId, 'action', action);
        newCount++;
      }
    }
  }

  broadcast(userId, 'sync_complete', { newActions: newCount });
}
