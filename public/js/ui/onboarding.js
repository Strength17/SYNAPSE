import { store } from '../store.js';

/**
 * Controller for the Onboarding Flow (3 screens)
 */

export const onboarding = {
  currentStep: 1,

  render() {
    const container = document.getElementById('screen-container');
    container.innerHTML = `<div id="onboarding-root"></div>`;
    this.showStep(1);
  },

  showStep(step) {
    const root = document.getElementById('onboarding-root');
    this.currentStep = step;

    if (step === 1) {
      root.innerHTML = `
        <div class="onboarding-screen">
          <div class="t-display">Your inbox,<br>automated.</div>
          <div class="t-body text-muted" style="margin: 20px 0;">Synapse reads every email and decides what needs to happen.</div>
          <button id="next-btn" class="btn-primary" style="width: 100%; height: 56px; border-radius: 28px; background: var(--blue); color: #fff; border: none; font-weight: bold; cursor: pointer;">See how it works →</button>
        </div>
      `;
    } else if (step === 2) {
      root.innerHTML = `
        <div class="onboarding-screen">
          <div class="t-title">AI finds what matters</div>
          <div class="t-body text-muted" style="margin: 20px 0;">Meetings, deadlines, and follow-ups are classified in seconds.</div>
          <button id="next-btn" class="btn-primary" style="width: 100%; height: 56px; border-radius: 28px; background: var(--blue); color: #fff; border: none; font-weight: bold; cursor: pointer;">Connect my inbox →</button>
        </div>
      `;
    } else if (step === 3) {
      root.innerHTML = `
        <div class="onboarding-screen">
          <div class="t-title">Connect your account</div>
          <div style="margin: 32px 0; width: 100%; display: flex; flex-direction: column; gap: 12px;">
            <a href="/api/auth/google" class="btn-oauth" style="background: #fff; color: #000; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>Continue with Gmail</span>
            </a>
          </div>
          <button id="demo-btn" style="background: none; border: 1px solid var(--gold); color: var(--gold); padding: 12px 24px; border-radius: 24px; cursor: pointer;">Try Demo Mode</button>
        </div>
      `;

      document.getElementById('demo-btn').onclick = () => {
        import('../engine/demo-data.js').then(({ demoData }) => {
          store.update({
            emails: demoData.emails,
            actions: demoData.actions,
            authState: 'authenticated',
            user: { email: 'demo@synapse.ai' }
          });
        });
      };
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.onclick = () => this.showStep(this.currentStep + 1);
    }
  }
};
