/**
 * Central State Management
 * Observable store pattern for UI reactivity.
 */

class Store {
  constructor() {
    this.state = {
      user: null,
      emails: [],
      actions: [],
      done: [],
      authState: 'loading', // loading | authenticated | unauthenticated | reconnect
      syncStatus: 'idle',    // idle | syncing
      currentTab: 'inbox',
      unreadCount: 0
    };
    this.listeners = new Set();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.notify();
  }

  update(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const store = new Store();
