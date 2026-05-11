/**
 * Simple regex-based extraction for times, urgency, and locations.
 * Used as a fallback when Claude API is unavailable or rate-limited.
 */

export const extractor = {
  /**
   * Detects urgency based on keywords.
   */
  detectUrgency: (text) => {
    const urgentWords = /\burgent|asap|immediately|critical|emergency|important\b/i;
    return urgentWords.test(text) ? 'High' : 'Normal';
  },

  /**
   * Detects meeting-related keywords and potentially times.
   */
  detectMeeting: (text) => {
    const meetingWords = /\bmeet|sync|zoom|call|calendar|schedule|interview|discussion\b/i;
    return meetingWords.test(text);
  },

  /**
   * Extracts simple time patterns (e.g., "10am", "tomorrow", "Monday").
   */
  extractTime: (text) => {
    const timePatterns = [
      /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i,
      /\btomorrow\b/i,
      /\bnext\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return null;
  }
};
