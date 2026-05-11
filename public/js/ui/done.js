import { store } from '../store.js';
import { components } from './components.js';

/**
 * Controller for the Done Tab
 */

export const done = {
  render() {
    const container = document.getElementById('screen-container');
    const items = store.get('done');

    container.innerHTML = `
      <div class="screen done-screen">
        <header style="padding: 16px;">
          <div class="t-title">Done</div>
        </header>
        <div id="done-list" style="padding: 0 16px;">
          ${items.length > 0 
            ? items.map(item => `
                <div class="done-item" style="padding: 16px; border-bottom: 1px solid var(--border-soft); opacity: 0.7;">
                  <div class="t-body bold">✓ ${item.email_subject}</div>
                  <div class="t-caption">${item.action_taken}</div>
                </div>
              `).join('') 
            : components.renderEmptyState('Nothing done yet.')}
        </div>
      </div>
    `;
  }
};
