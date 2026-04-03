/* ══════════════════════════════════════════
   ui.js — Navigation, dark mode, shared UI
══════════════════════════════════════════ */

const APP = {
  navTo(screenId) {
    const cur = document.querySelector('.screen.active');
    if (cur) {
      STATE.screenStack.push(cur.id);
      cur.classList.remove('active');
    }
    const next = document.getElementById(screenId);
    if (next) {
      next.classList.add('active');
      STATE.currentScreen = screenId;
      this.onScreenEnter(screenId);
    }
    // update bottom nav
    document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
    const map = { scrHome: 0, scrSend: 1, scrInsights: 3, scrHistory: 4 };
    const idx = map[screenId];
    if (idx !== undefined) document.querySelectorAll('.bn-item')[idx]?.classList.add('active');
  },

  navBack() {
    if (STATE.screenStack.length === 0) { this.navTo('scrHome'); return; }
    const prev = STATE.screenStack.pop();
    const cur = document.querySelector('.screen.active');
    if (cur) cur.classList.remove('active');
    const prevEl = document.getElementById(prev);
    if (prevEl) {
      prevEl.classList.add('active');
      STATE.currentScreen = prev;
    }
  },

  onScreenEnter(id) {
    if (id === 'scrHome')     { renderHome(); }
    if (id === 'scrSend')     { resetSendForm(); }
    if (id === 'scrInsights') { renderInsights(); }
    if (id === 'scrCalendar') { renderCalendar(); }
    if (id === 'scrHistory')  { renderHistory(); }
    if (id === 'scrSettle')   { renderSettle(); }
    if (id === 'scrReceive')  { renderReceive(); }
  },

  showSecurityAlert() {
    if (STATE.securityShown) return;
    STATE.securityShown = true;
    const box = document.getElementById('securityModalBox');
    box.innerHTML = `
      <div class="sec-modal-icon">🔐</div>
      <div class="sec-modal-title">New Login Detected</div>
      <div class="sec-modal-body">Someone just logged into your Paytm account from a new device. Was this you?</div>
      <div class="sec-modal-device">
        <div class="smd-row"><span class="smd-lbl">Device</span><span class="smd-val">iPhone 15 Pro</span></div>
        <div class="smd-row"><span class="smd-lbl">Location</span><span class="smd-val">Mumbai, Maharashtra</span></div>
        <div class="smd-row"><span class="smd-lbl">Time</span><span class="smd-val">Today, 11:32 AM</span></div>
        <div class="smd-row"><span class="smd-lbl">IP</span><span class="smd-val">103.21.xx.xx</span></div>
      </div>
      <div class="sec-btns">
        <button class="sec-btn-no" onclick="APP.securityAction(false)">🚫 Not Me!</button>
        <button class="sec-btn-yes" onclick="APP.securityAction(true)">✓ Yes, it's me</button>
      </div>
    `;
    document.getElementById('securityModal').classList.remove('hidden');
  },

  securityAction(isMe) {
    document.getElementById('securityModal').classList.add('hidden');
    if (!isMe) {
      showToast('🔒 Account secured! Session terminated & password reset sent.', 'red');
    } else {
      showToast('✓ Login verified. Stay safe!', 'green');
    }
  }
};

// ── NAV HELPERS ──
function navTo(id) { APP.navTo(id); }
function navBack() { APP.navBack(); }

// ── CLOCK ──
function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const el = document.getElementById('sbTime');
  if (el) el.textContent = `${h}:${m < 10 ? '0' : ''}${m}`;
}
setInterval(updateClock, 30000);
updateClock();

// ── DARK MODE ──
function toggleDark() {
  STATE.darkMode = !STATE.darkMode;
  document.body.classList.toggle('dark', STATE.darkMode);
  document.getElementById('app').classList.toggle('dark', STATE.darkMode);
}

// ── TOAST ──
function showToast(msg, type = 'blue') {
  const colors = { blue: '#00b9f1', green: '#00a86b', red: '#e02020', orange: '#ff7c00' };
  const t = document.createElement('div');
  t.style.cssText = `position:absolute;bottom:85px;left:16px;right:16px;background:${colors[type]};color:white;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:600;z-index:200;animation:slideUp .3s ease;box-shadow:0 4px 16px rgba(0,0,0,0.25);`;
  t.textContent = msg;
  document.getElementById('app').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── NOTIFICATIONS ──
function showNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const list = document.getElementById('notifList');
  list.innerHTML = NOTIFICATIONS.map((n, i) => `
    <div class="notif-item" onclick="APP.navTo('scrHome');hideNotifPanel()">
      <div class="ni-icon" style="background:${n.bg}">${n.icon}</div>
      <div class="ni-info">
        <div class="ni-title">${n.title}</div>
        <div class="ni-body">${n.body}</div>
        <div class="ni-time">${n.time}</div>
      </div>
    </div>
  `).join('');
  panel.classList.remove('hidden');
  // trigger security after delay
  setTimeout(() => {
    if (!STATE.securityShown) APP.showSecurityAlert();
  }, 800);
}

function hideNotifPanel() {
  document.getElementById('notifPanel').classList.add('hidden');
}

// ── ONBOARDING ──
function obNext() {
  const nameEl = document.getElementById('obName');
  const balEl  = document.getElementById('obBalance');
  const name   = nameEl.value.trim() || 'Arjun';
  const rawBal = balEl.value.replace(/[^0-9]/g, "");
  const bal    = parseInt(rawBal) || 5000;
  if (!rawBal) {
    balEl.style.borderColor = "#FF4B4B";
    balEl.style.background  = "#FFF0F0";
    balEl.placeholder = "Enter an amount first!";
    balEl.focus();
    setTimeout(() => { balEl.style.borderColor = ""; balEl.style.background = ""; balEl.placeholder = "e.g. 5000"; }, 2500);
    return;
  }
  STATE.userName = name;
  STATE.walletBalance = bal;
  document.getElementById("ob1").classList.remove("active");
  document.getElementById("ob2").classList.add("active");
}

function obFinish() {
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  renderHome();
  // security alert after 4 seconds
  setTimeout(() => APP.showSecurityAlert(), 4000);
}

// ── HOME RENDER ──
function renderHome() {
  const name = STATE.userName;
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const el = document.getElementById('homeHi');
  if (el) el.textContent = `${greeting}, ${name} 👋`;
  const av = document.getElementById('homeAvatar');
  if (av) av.textContent = name[0].toUpperCase();
  const wd = document.getElementById('walletDisplay');
  if (wd) wd.textContent = '₹' + STATE.walletBalance.toLocaleString('en-IN');
  renderRemindersHome();
  renderSpendPreview();
  renderRecentTxns();
  // rotate copilot banner tips
  const tips = [
    'Watching your payments in real-time',
    'Bill Split ready — just pause on Send Money',
    'Voice Pay: tap the mic on Send screen',
    `${name}, your electricity bill is overdue!`,
  ];
  let ti = 0;
  const cbSub = document.getElementById('cbSub');
  if (cbSub) {
    setInterval(() => { if(cbSub) cbSub.textContent = tips[ti++ % tips.length]; }, 3500);
  }
}

function renderRecentTxns() {
  const el = document.getElementById('recentTxns');
  if (!el) return;
  const recent = STATE.transactions.slice(0, 4);
  el.innerHTML = `<div style="background:var(--card);border-radius:var(--r);margin:0 16px 16px;box-shadow:var(--shadow);overflow:hidden">` +
    recent.map(t => `
      <div class="txn-item">
        <div class="txn-avatar" style="background:${t.color}">${t.name[0]}</div>
        <div class="txn-info">
          <div class="txn-name">${t.name}</div>
          <div class="txn-note">${t.note}</div>
        </div>
        <div class="txn-amt">
          <div class="txn-amt-val ${t.type === 'debit' ? 'txn-debit' : 'txn-credit'}">
            ${t.type === 'debit' ? '−' : '+'}₹${t.amt.toLocaleString('en-IN')}
          </div>
          <div class="txn-time">${t.time}</div>
        </div>
      </div>
    `).join('') + '</div>';
}

function renderSpendPreview() {
  const el = document.getElementById('spendPreview');
  const tip = document.getElementById('spendTip');
  if (!el) return;
  const d = SPENDING_DATA.week;
  const max = Math.max(...d.values);
  const colors = ['#00b9f1','#7c3aed','#e02020','#ff7c00','#00a86b','#00b9f1','#7c3aed'];
  el.innerHTML = d.values.map((v, i) => `
    <div class="sp-bar-wrap">
      <div class="sp-bar" style="height:${max > 0 ? Math.round((v/max)*46)+4 : 4}px;background:${v > 0 ? colors[i] : 'var(--border)'}"></div>
      <div class="sp-bar-lbl">${d.labels[i]}</div>
    </div>
  `).join('');
  if (tip) tip.innerHTML = d.tip;
}

// ── RECEIVE SCREEN ──
function renderReceive() {
  const qr = document.getElementById('qrCode');
  const upi = document.getElementById('qrUPI');
  const nm = document.getElementById('qrName');
  if (upi) upi.textContent = `${STATE.userName.toLowerCase()}@paytm`;
  if (nm) nm.textContent = STATE.userName;
  if (qr) {
    // Fake QR pattern
    const cells = [];
    const pattern = [
      1,1,1,1,1,1,1, 0,1,0,1,0,1, 1,1,1,0,1,1,1,
      1,0,0,0,0,0,1, 0,0,1,0,1,0, 1,0,0,0,0,0,1,
      1,0,1,1,1,0,1, 1,0,0,1,0,1, 1,0,1,1,1,0,1,
      1,0,1,1,1,0,1, 0,1,1,0,1,1, 1,0,1,1,1,0,1,
      1,0,0,0,0,0,1, 1,0,1,0,0,0, 1,0,0,0,0,0,1,
      1,1,1,1,1,1,1, 0,1,0,1,0,1, 1,1,1,1,1,1,1,
      0,0,0,0,0,0,0, 1,0,1,0,1,0, 0,0,0,0,0,0,0,
    ];
    qr.innerHTML = Array.from({length: 49}, (_, i) => {
      const on = Math.random() > 0.5 || (i < 21 && pattern[i]);
      return `<div class="qr-cell" style="background:${on ? '#002d62' : 'transparent'};border-radius:1px"></div>`;
    }).join('');
  }
}
