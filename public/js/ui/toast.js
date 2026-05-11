/**
 * Stacked Toast Notification System
 */

export const toast = {
  show(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-content">${message}</div>
      <div class="toast-progress"></div>
    `;

    container.appendChild(el);

    // Auto-dismiss
    setTimeout(() => {
      el.classList.add('toast-exit');
      setTimeout(() => el.remove(), 400);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error', 6000); },
  info(msg) { this.show(msg, 'info'); }
};
