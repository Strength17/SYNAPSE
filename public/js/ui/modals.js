import { store } from '../store.js';

/**
 * Controller for Action Detail Modal
 */

export const modals = {
  openEmailDetail(email) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <div class="t-title">Email Detail</div>
          <button id="close-modal" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
        </div>
        <div class="t-body" style="white-space: pre-wrap;">${email.body_text}</div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(overlay);
    document.getElementById('close-modal').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  }
};
