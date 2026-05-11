import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = 'claude-3-haiku-20240307';

/**
 * Classifies an email using Claude AI.
 * @param {Object} email - The normalized email object.
 * @returns {Promise<Object>} The classification result.
 */
export async function classifyEmail(email) {
  const prompt = `
    Analyze this email and return ONLY a JSON object (no markdown, no preamble).
    
    SUBJECT: ${email.subject}
    SENDER: ${email.sender_name} (${email.sender_email})
    BODY: ${email.body_text?.slice(0, 2000) || email.preview}

    SCHEMA:
    {
      "type": "meeting|urgent|deadline|followup|info|unknown",
      "detected": "Brief label of what was detected (e.g., 'Project Sync Meeting')",
      "urgency": "High|Normal|Low",
      "time_text": "Extracted time/date string or null",
      "location_text": "Extracted location or null",
      "action_label": "Specific recommended action (e.g., 'Schedule Sync')",
      "ai_summary": "One sentence summary",
      "confidence": 0.0-1.0
    }
  `;

  try {
    const msg = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].text;
    // Strip potential markdown fences
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Claude Classification Error:', err.message);
    throw new Error('Classification failed');
  }
}

/**
 * Generates a polite reply draft for an email.
 * @param {Object} email 
 * @param {Object} classification 
 */
export async function draftReply(email, classification) {
  const prompt = `
    Draft a polite, professional reply to this email based on the classification.
    Keep it under 60 words. No placeholder brackets.
    
    EMAIL: ${email.subject}
    FROM: ${email.sender_name}
    INTENT: ${classification.detected}
  `;

  try {
    const msg = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    return msg.content[0].text.trim();
  } catch (err) {
    console.error('Claude Drafting Error:', err.message);
    return null;
  }
}
