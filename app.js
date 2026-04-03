/* ══════════════════════════════════════════
   app.js — Boot
══════════════════════════════════════════ */

// Kick off on load
window.addEventListener('DOMContentLoaded', () => {
  // Prefer dark system
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    STATE.darkMode = true;
    document.body.classList.add('dark');
    document.getElementById('app')?.classList.add('dark');
  }
  // Start with onboarding shown, app hidden — already set in HTML
});
