import { store } from './store.js';
import { router } from './router.js';
import { api } from './api.js';

// UI Controllers
import { inbox } from './ui/inbox.js';
import { actionsTab } from './ui/actions-tab.js';
import { done } from './ui/done.js';
import { settings } from './ui/settings.js';
import { onboarding } from './ui/onboarding.js';
import { loading } from './ui/loading.js';

/**
 * Main Boot Sequence
 */

async function boot() {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW failed:', err));
  }

  // 2. Initialize Router
  router.init();

  // 3. Check Authentication
  try {
    const auth = await api.getMe();
    if (auth && auth.user) {
      store.update({ user: auth.user, authState: 'authenticated' });
      startApp();
    } else {
      store.set('authState', 'unauthenticated');
      onboarding.render();
    }
  } catch (err) {
    store.set('authState', 'unauthenticated');
    onboarding.render();
  }

  // 4. Subscribe to Store Changes
  store.subscribe(state => {
    if (state.authState === 'authenticated') {
      renderCurrentTab(state.currentTab);
    }
  });
}

function startApp() {
  // Fetch initial data
  api.getEmails({}).then(data => store.set('emails', data.emails));
  api.getActions().then(data => store.set('actions', data));
  api.getDone({}).then(data => store.set('done', data));
  
  initSSE();
}

function renderCurrentTab(tab) {
  const controllers = { inbox, actions: actionsTab, done, settings };
  if (controllers[tab]) {
    controllers[tab].render();
  }

  // Update Nav Active State
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
}

function initSSE() {
  const es = new EventSource('/api/stream', { withCredentials: true });

  es.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    
    if (type === 'email') {
      const emails = store.get('emails');
      store.set('emails', [data, ...emails]);
    }
    
    if (type === 'action') {
      const actions = store.get('actions');
      store.set('actions', [data, ...actions]);
    }

    if (type === 'sync_start') store.set('syncStatus', 'syncing');
    if (type === 'sync_complete') store.set('syncStatus', 'idle');
  };

  es.onerror = () => {
    console.error('SSE connection lost');
    es.close();
    // Retry connection after 5s
    setTimeout(initSSE, 5000);
  };
}

// Global Nav Clicks
document.addEventListener('click', e => {
  const navItem = e.target.closest('.nav-item');
  if (navItem) {
    router.navigate(navItem.dataset.tab);
  }
});

// Kick off
boot();
