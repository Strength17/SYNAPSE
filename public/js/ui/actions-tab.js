import { store } from '../store.js';
import { components } from './components.js';
import { api } from '../api.js';
import { toast } from './toast.js';

/**
 * Controller for the Actions Tab
 */

export const actionsTab = {
  render() {
    const container = document.getElementById('screen-container');
    const actions = store.get('actions');

    container.innerHTML = `
      <div class="screen actions-screen">
        <header style="padding: 16px;">
          <div class="t-title">Actions</div>
        </header>
        <div id="actions-list" style="padding: 0 16px;">
          ${actions.length > 0 
            ? actions.map(a => components.renderActionCard(a)).join('') 
            : components.renderEmptyState('No pending actions.')}
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    const list = document.getElementById('actions-list');
    if (!list) return;

    list.onclick = async (e) => {
      const card = e.target.closest('.action-card');
      if (!card) return;

      const actionId = card.dataset.id;
      
      try {
        const result = await api.implementAction(actionId);
        toast.success(`Action implemented!`);
        
        // Remove from local state
        const actions = store.get('actions').filter(a => a.id !== actionId);
        store.set('actions', actions);
        
        // Add to done history
        const doneItems = store.get('done');
        store.set('done', [result, ...doneItems]);
        
        this.render();
      } catch (err) {
        toast.error('Failed to implement action');
      }
    };
  }
};
