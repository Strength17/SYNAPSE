import { store } from '../store.js';

/**
 * Controller for the Post-Auth Loading Screen
 */

export const loading = {
  render() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `
      <div class="onboarding-screen">
        <img src="/logo.png" style="width: 80px; margin-bottom: 24px;">
        <div class="t-title">Setting up your inbox...</div>
        <div id="loading-steps" style="margin-top: 24px; text-align: left; width: 240px;">
          <div class="step" data-id="auth">✓ Connected to Account</div>
          <div class="step" data-id="sync">⏳ Fetching emails...</div>
          <div class="step" data-id="ai">⏳ Analyzing intelligence...</div>
        </div>
      </div>
    `;
  },

  updateStep(stepId, status) {
    const el = document.querySelector(`.step[data-id="${stepId}"]`);
    if (el) {
      el.innerHTML = status === 'done' ? `✓ ${el.textContent.slice(2)}` : `⏳ ${el.textContent.slice(2)}`;
    }
  }
};
