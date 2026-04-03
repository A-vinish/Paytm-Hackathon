/* ══════════════════════════════════════════
   state.js — Global app state
══════════════════════════════════════════ */

const STATE = {
  userName: 'Avinish',
  walletBalance: 5000,
  cashback: 124,
  darkMode: false,
  currentScreen: 'scrHome',
  screenStack: [],

  // send form state
  sendName: '',
  sendUPI: '',
  sendAmt: 0,
  sendNote: '',
  dwellTimer: null,
  dwellFired: false,

  // split state
  splitTotal: 0,
  splitTo: '',
  splitChecked: { 0: true, 1: true, 2: false, 3: false },

  // bills state
  bills: JSON.parse(JSON.stringify(BILLS)),

  // transactions
  transactions: [...INITIAL_TRANSACTIONS],

  // insights period
  insightsPeriod: 'week',

  // voice
  voiceLang: 'en',
  recognition: null,
  micActive: false,

  // settle
  settleData: JSON.parse(JSON.stringify(SETTLE_DATA)),

  // security alert shown
  securityShown: false,
};

function deductWallet(amount) {
  STATE.walletBalance = Math.max(0, STATE.walletBalance - amount);
  const el = document.getElementById('walletDisplay');
  if (el) el.textContent = '₹' + STATE.walletBalance.toLocaleString('en-IN');
}

function addTransaction(txn) {
  STATE.transactions.unshift({ id: Date.now(), ...txn, time: 'Just now' });
}
