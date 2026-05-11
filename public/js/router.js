import { store } from './store.js';

/**
 * Hash-based router for tab navigation.
 */

export const router = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'inbox';
    const validTabs = ['inbox', 'actions', 'done', 'settings'];
    
    if (validTabs.includes(hash)) {
      store.set('currentTab', hash);
    } else {
      window.location.hash = 'inbox';
    }
  },

  navigate(tab) {
    window.location.hash = tab;
  }
};
