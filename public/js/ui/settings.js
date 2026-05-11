import { store } from '../store.js';
import { api } from '../api.js';

/**
 * Controller for the Settings Tab
 */

export const settings = {
  render() {
    const container = document.getElementById('screen-container');
    const user = store.get('user');

    container.innerHTML = `
      <div class="screen settings-screen">
        <header style="padding: 16px;">
          <div class="t-title">Settings</div>
        </header>
        <div style="padding: 16px; display: flex; flex-direction: column; gap: 24px;">
          <section>
            <div class="t-caption text-muted">ACCOUNT</div>
            <div style="margin-top: 8px;">
              <div class="t-body">${user?.email || 'Not connected'}</div>
              <button id="logout-btn" style="margin-top: 8px; color: var(--red); background: none; border: none; font-weight: bold; cursor: pointer;">Disconnect</button>
            </div>
          </section>

          <section>
            <div class="t-caption text-muted">AI BEHAVIOR</div>
            <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
              <div class="t-body">Auto-pilot mode</div>
              <input type="checkbox" checked>
            </div>
          </section>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await api.logout();
        window.location.reload();
      };
    }
  }
};
