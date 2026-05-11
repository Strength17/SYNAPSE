import { google } from 'googleapis';
import { getValidToken } from './tokens.js';

/**
 * Fetches the latest emails from a user's Gmail inbox.
 * @param {string} userId - UUID of the profile.
 * @param {number} maxResults - Max emails to fetch (default 50).
 * @returns {Promise<Array>} Normalized email objects.
 */
export async function fetchEmails(userId, maxResults = 50) {
  const token = await getValidToken(userId);
  
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // 1. Get message list
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox -category:promotions -category:social'
  });

  if (!listRes.data.messages) return [];

  // 2. Fetch full details for each message
  const emails = await Promise.all(
    listRes.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });
      return normalizeGmail(detail.data);
    })
  );

  return emails;
}

/**
 * Normalizes a raw Gmail message object into our internal schema.
 */
function normalizeGmail(msg) {
  const headers = msg.payload.headers;
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('subject');
  const fromRaw = getHeader('from');
  const senderName = fromRaw.split('<')[0].trim() || fromRaw;
  const senderEmail = fromRaw.match(/<(.+)>/)?.[1] || fromRaw;

  // Extract body (simplified for now, handles text/plain)
  let bodyText = '';
  if (msg.payload.parts) {
    const textPart = msg.payload.parts.find(p => p.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
      bodyText = Buffer.from(textPart.body.data, 'base64').toString('utf8');
    }
  } else if (msg.payload.body.data) {
    bodyText = Buffer.from(msg.payload.body.data, 'base64').toString('utf8');
  }

  return {
    provider_email_id: msg.id,
    thread_id: msg.threadId,
    subject,
    sender_name: senderName,
    sender_email: senderEmail,
    preview: msg.snippet,
    body_text: bodyText,
    received_at: new Date(parseInt(msg.internalDate)).toISOString(),
    type: 'unknown', // Set by AI engine later
    raw_labels: msg.labelIds
  };
}

/**
 * Basic heuristics for smart categorization before AI processing.
 * @param {Object} email 
 * @returns {string} 'people' | 'newsletters' | 'system'
 */
export function detectCategory(email) {
  const sender = email.sender_email.toLowerCase();
  
  // Heuristics
  const isSystem = /no-reply|noreply|notification|alert|support|system|billing/i.test(sender);
  const isNewsletter = email.raw_labels?.includes('CATEGORY_PROMOTIONS') || 
                      email.raw_labels?.includes('CATEGORY_UPDATES') ||
                      /newsletter|digest|daily|weekly/i.test(email.sender_name);

  if (isNewsletter) return 'newsletters';
  if (isSystem) return 'system';
  return 'people';
}
