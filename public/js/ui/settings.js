import { store } from '../store.js';

/**
 * Controller for Settings Tab
 */

export const settings = {
  render() {
    const container = document.getElementById('screen-container');
    const user = store.get('user');

    container.innerHTML = `
      <div class="screen settings-screen" style="padding: 16px;">
        <div class="t-title" style="margin-bottom: 24px;">Settings</div>
        
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <section class="card-glass" style="padding: 16px;">
            <div class="t-micro" style="color: var(--text-secondary);">ACCOUNT</div>
            <div style="margin-top: 12px;">
              <div class="t-body">${user?.email || 'Not connected'}</div>
              <button id="logout-btn" style="margin-top: 12px; background: var(--red-subtle); color: var(--red); border: 1px solid var(--red-border); padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">Disconnect Account</button>
            </div>
          </section>

          <section class="card-glass" style="padding: 16px;">
            <div class="t-micro" style="color: var(--text-secondary);">SYNC</div>
            <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
              <div class="t-body">Sync interval</div>
              <select id="sync-interval" style="background: var(--bg-input); color: white; border: 1px solid var(--border-soft); padding: 4px 8px; border-radius: 4px;">
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="3600">1 hour</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    `;
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('logout-btn').onclick = async () => {
      await api.logout();
      window.location.reload();
    };
  }
};
