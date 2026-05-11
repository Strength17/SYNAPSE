/**
 * Pure Render Functions for UI Components
 */

export const components = {
  /**
   * Renders an Email Card.
   */
  renderEmailCard(email) {
    const typeColor = {
      meeting: 'var(--blue)',
      urgent: 'var(--red)',
      deadline: 'var(--amber)',
      followup: 'var(--purple)',
      info: 'var(--silver)'
    }[email.type] || 'var(--silver)';

    return `
      <div class="email-card" data-id="${email.id}" style="--type-color: ${typeColor}">
        <div class="card-content">
          <div class="card-header">
            <span class="sender-name t-heading">${email.sender_name}</span>
            <span class="received-at t-caption">${new Date(email.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="subject t-body bold">${email.subject}</div>
          <div class="preview t-caption">${email.preview}</div>
        </div>
      </div>
    `;
  },

  /**
   * Renders an Action Card.
   */
  renderActionCard(action) {
    return `
      <div class="action-card" data-id="${action.id}">
        <div class="action-type badge badge-gold">${action.detected}</div>
        <div class="action-body t-title">${action.action_label}</div>
        ${action.time_text ? `<div class="action-meta t-body">📅 ${action.time_text}</div>` : ''}
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${action.confidence * 100}%"></div>
        </div>
        <div class="action-footer t-micro">
          ${Math.round(action.confidence * 100)}% confidence
        </div>
      </div>
    `;
  },

  /**
   * Renders a Skeleton Loader Card.
   */
  renderSkeletonCard() {
    return `
      <div class="email-card skeleton">
        <div style="height: 60px; width: 100%;"></div>
      </div>
    `;
  },

  /**
   * Renders an Empty State.
   */
  renderEmptyState(msg = 'All caught up!') {
    return `
      <div class="empty-state">
        <div class="empty-msg t-body text-muted">${msg}</div>
      </div>
    `;
  }
};
