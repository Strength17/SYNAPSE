import { store } from '../store.js';
import { components } from './components.js';
import { api } from '../api.js';
import { modals } from './modals.js';

/**
 * Controller for the Inbox Tab
 */

export const inbox = {
  render() {
    const container = document.getElementById('screen-container');
    const emails = store.get('emails');

    container.innerHTML = `
      <div class="screen inbox-screen">
        <header class="sticky-header" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div class="t-title">Inbox</div>
          <button id="sync-btn" style="background: none; border: none; color: var(--gold); font-weight: bold; cursor: pointer;">Sync</button>
        </header>
        <div id="email-list" style="padding: 0 16px;">
          ${emails.length > 0 
            ? emails.map(e => components.renderEmailCard(e)).join('') 
            : components.renderEmptyState()}
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
      syncBtn.onclick = async () => {
        store.set('syncStatus', 'syncing');
        await api.syncEmails();
        store.set('syncStatus', 'idle');
        this.render();
      };
    }

    document.getElementById('email-list').onclick = async (e) => {
      const card = e.target.closest('.email-card');
      if (card) {
        const email = await api.getEmail(card.dataset.id);
        modals.openEmailDetail(email);
      }
    };
  }
};
