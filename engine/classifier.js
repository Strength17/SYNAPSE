import { classifyEmail } from '../services/claude.js';
import { extractor } from './extractor.js';

/**
 * Orchestrates email classification.
 * Tries Claude AI first, falls back to Regex-based extractor on error.
 */
export async function classify(email) {
  try {
    const aiResult = await classifyEmail(email);
    return {
      ...aiResult,
      source: 'claude'
    };
  } catch (err) {
    console.error('Claude failed, falling back to extractor:', err.message);
    
    // Fallback logic
    const isMeeting = extractor.detectMeeting(email.subject + ' ' + email.body_text);
    const urgency = extractor.detectUrgency(email.subject + ' ' + email.body_text);
    const time = extractor.extractTime(email.body_text);

    return {
      type: isMeeting ? 'meeting' : (urgency === 'High' ? 'urgent' : 'info'),
      detected: isMeeting ? 'Meeting detected' : 'Information',
      urgency,
      time_text: time,
      location_text: null,
      action_label: isMeeting ? 'Schedule' : 'Review',
      ai_summary: email.preview,
      confidence: 0.5,
      source: 'fallback'
    };
  }
}
