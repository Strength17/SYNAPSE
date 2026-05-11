/**
 * Logic for building action objects from classifications.
 */

export function buildAction(emailId, userId, classification) {
  const { type, detected, urgency, time_text, location_text, action_label, confidence } = classification;

  // Build implementation steps (badges shown in UI)
  const impl = [];
  
  if (type === 'meeting') {
    impl.push({ badge: 'queued', label: 'Drafting Calendar entry', source: 'auto-system' });
  }
  
  if (urgency === 'High') {
    impl.push({ badge: 'alert', label: 'High priority alert', source: 'auto-system' });
  }

  impl.push({ badge: 'info', label: `Analysis: ${type}`, source: 'claude' });

  return {
    user_id: userId,
    email_id: emailId,
    detected,
    action_label,
    time_text,
    location_text,
    urgency,
    confidence,
    status: 'pending',
    impl
  };
}
