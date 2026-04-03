/* ══════════════════════════════════════════
   send.js — Send money, fraud, dwell, cashback
══════════════════════════════════════════ */

function resetSendForm() {
  clearDwellTimer();
  STATE.dwellFired = false;
  ['sfName','sfUPI','sfAmt','sfNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('sfSuggestions')?.classList.add('hidden');
  document.getElementById('upiRep')?.classList.add('hidden');
  document.getElementById('fraudPanel')?.classList.add('hidden');
  document.getElementById('cashbackStrip')?.classList.add('hidden');
  document.getElementById('cpThinking')?.classList.add('hidden');
  document.getElementById('dwellPopup')?.classList.add('hidden');
  document.getElementById('voiceStrip')?.classList.add('hidden');
  const bar = document.getElementById('amtRiskBar');
  if (bar) { bar.style.width = '0%'; bar.style.background = '#e0e0e0'; }
  const lbl = document.getElementById('amtRiskLabel');
  if (lbl) { lbl.textContent = ''; lbl.style.color = ''; }
  STATE.sendAmt = 0;
  STATE.sendName = '';
  STATE.sendUPI = '';
}

// ── NAME AUTOCOMPLETE ──
function onSendInput() {
  const val = document.getElementById('sfName').value.trim().toLowerCase();
  STATE.sendName = val;
  const sug = document.getElementById('sfSuggestions');
  if (!val || val.length < 1) { sug?.classList.add('hidden'); return; }
  const matches = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(val) || c.upi.toLowerCase().includes(val)
  );
  if (matches.length === 0) { sug?.classList.add('hidden'); return; }
  sug.innerHTML = matches.slice(0, 4).map(c => `
    <div class="sug-item" onclick="selectContact('${c.name}','${c.upi}','${c.color}')">
      <div class="sug-av" style="background:${c.color}">${c.initial}</div>
      <div>
        <div class="sug-name">${c.name}</div>
        <div class="sug-upi">${c.upi}</div>
      </div>
    </div>
  `).join('');
  sug.classList.remove('hidden');
}

function selectContact(name, upi, color) {
  document.getElementById('sfName').value = name;
  document.getElementById('sfUPI').value = upi;
  STATE.sendName = name;
  STATE.sendUPI = upi;
  document.getElementById('sfSuggestions')?.classList.add('hidden');
  checkUPIRep(upi);
  showCashbackSuggestion();
  document.getElementById('sfAmt')?.focus();
}

// ── UPI REPUTATION ──
function onUPIInput() {
  const val = document.getElementById('sfUPI').value.trim();
  STATE.sendUPI = val;
  if (val.length > 3) {
    checkUPIRep(val);
  } else {
    document.getElementById('upiRep')?.classList.add('hidden');
  }
}

function checkUPIRep(upi) {
  const rep = document.getElementById('upiRep');
  if (!rep) return;
  const known = KNOWN_UPI[upi];
  const suspicious = SUSPICIOUS_UPI_PATTERNS.some(p => upi.toLowerCase().includes(p));
  if (known) {
    const scoreColor = known.score > 85 ? 'var(--success-d)' : known.score > 60 ? 'var(--warning)' : '#e02020';
    rep.innerHTML = `
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">👥 Total users</span>
        <span class="upi-rep-val">${known.users.toLocaleString('en-IN')}</span>
      </div>
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">📅 Account age</span>
        <span class="upi-rep-val">${known.age}</span>
      </div>
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">📍 Registered</span>
        <span class="upi-rep-val">${known.location}</span>
      </div>
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">⭐ Trust score</span>
        <span class="upi-rep-val" style="color:${scoreColor}">${known.score}/100</span>
      </div>
      <div class="rep-score-bar">
        <div class="rep-score-fill" style="width:${known.score}%;background:${scoreColor}"></div>
      </div>
    `;
    rep.classList.remove('hidden');
  } else if (suspicious || upi.length > 5) {
    const score = suspicious ? Math.floor(Math.random() * 25 + 5) : Math.floor(Math.random() * 30 + 20);
    const scoreColor = score < 30 ? '#e02020' : 'var(--warning)';
    rep.innerHTML = `
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">👥 Total users</span>
        <span class="upi-rep-val" style="color:var(--danger)">Unknown / New</span>
      </div>
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">📅 Account age</span>
        <span class="upi-rep-val" style="color:var(--warning)">< 30 days</span>
      </div>
      <div class="upi-rep-row">
        <span class="upi-rep-lbl">⭐ Trust score</span>
        <span class="upi-rep-val" style="color:${scoreColor}">${score}/100</span>
      </div>
      <div class="rep-score-bar">
        <div class="rep-score-fill" style="width:${score}%;background:${scoreColor}"></div>
      </div>
      ${suspicious ? `<div class="fraud-location">
        <div class="fraud-loc-row"><div class="fraud-loc-dot" style="background:var(--danger)"></div><div class="fraud-loc-txt">⚠ UPI pattern matches known fraud domains</div></div>
        <div class="fraud-map-fake">
          <div class="fmap-ring"></div>
          <div class="fmap-pin">📍</div>
        </div>
      </div>` : ''}
    `;
    rep.classList.remove('hidden');
  }
}

// ── AMOUNT + RISK BAR ──
function onAmtInput() {
  const val = parseInt(document.getElementById('sfAmt').value) || 0;
  STATE.sendAmt = val;
  const bar = document.getElementById('amtRiskBar');
  const lbl = document.getElementById('amtRiskLabel');
  const fraudPanel = document.getElementById('fraudPanel');
  if (!bar || !lbl) return;
  const pct = Math.min(100, Math.round((val / 15000) * 100));
  bar.style.width = pct + '%';
  const upi = (document.getElementById('sfUPI').value || '').toLowerCase();
  const suspicious = SUSPICIOUS_UPI_PATTERNS.some(p => upi.includes(p));
  if (val <= 0) {
    bar.style.background = '#e0e0e0'; lbl.textContent = ''; fraudPanel?.classList.add('hidden');
  } else if (val <= 2000 && !suspicious) {
    bar.style.background = 'var(--success-d)'; lbl.style.color = 'var(--success-d)'; lbl.textContent = '✓ Safe amount';
    showFraudPanel('safe', val, upi);
  } else if (val <= 10000 || (val > 0 && !suspicious)) {
    bar.style.background = 'var(--warning)'; lbl.style.color = 'var(--warning)'; lbl.textContent = '⚠ Double-check UPI before paying';
    showFraudPanel('warn', val, upi);
  } else {
    bar.style.background = '#e02020'; lbl.style.color = '#e02020'; lbl.textContent = '🚨 High risk — read warning below';
    showFraudPanel('danger', val, upi);
  }
  // cashback suggestion
  if (val > 0) showCashbackSuggestion();
}

function showFraudPanel(level, amt, upi) {
  const panel = document.getElementById('fraudPanel');
  if (!panel) return;
  const suspicious = SUSPICIOUS_UPI_PATTERNS.some(p => upi.includes(p));
  const conf = level === 'danger' ? Math.floor(Math.random()*15+80) : level === 'warn' ? Math.floor(Math.random()*20+45) : Math.floor(Math.random()*10+5);
  if (level === 'safe' && !suspicious) {
    panel.className = 'risk-card risk-safe';
    panel.innerHTML = `<div class="risk-badge rb-safe">✓ Safe</div><div class="risk-txt">Verified UPI · Normal amount · No fraud signals detected. Good to go! 🟢</div>`;
  } else if (level === 'warn') {
    panel.className = 'risk-card risk-warn';
    panel.innerHTML = `
      <div class="risk-badge rb-warn">⚠ Check carefully</div>
      <div class="risk-txt">
        ⚠ Amount above ₹2,000 — verify UPI<br>
        ⚠ Confirm you know this recipient<br>
        ${suspicious ? '⚠ UPI domain looks unusual<br>' : ''}
        <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
          <div style="flex:1;height:4px;background:var(--border);border-radius:3px">
            <div style="width:${conf}%;height:100%;background:var(--warning);border-radius:3px"></div>
          </div>
          <span style="font-size:11px;font-weight:700;color:var(--warning)">${conf}% fraud risk</span>
        </div>
      </div>`;
  } else {
    panel.className = 'risk-card risk-danger';
    panel.innerHTML = `
      <div class="risk-badge rb-danger">🚨 HIGH RISK</div>
      <div class="risk-txt">
        ❌ Amount ₹${amt.toLocaleString('en-IN')} exceeds ₹10,000<br>
        ${suspicious ? '❌ UPI pattern matches fraud domains<br>' : ''}
        ❌ UPI payments are <strong>irreversible</strong><br>
        ❌ ${Math.floor(Math.random()*15+5)} users reported this as fraud<br>
        <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
          <div style="flex:1;height:4px;background:rgba(224,32,32,0.2);border-radius:3px">
            <div style="width:${conf}%;height:100%;background:var(--danger);border-radius:3px"></div>
          </div>
          <span style="font-size:11px;font-weight:700;color:var(--danger)">${conf}% fraud risk</span>
        </div>
      </div>
      <button onclick="blockAndReport()" style="margin-top:10px;width:100%;padding:10px;background:var(--danger);color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">🛡 Block & Report Fraud</button>`;
  }
  panel.classList.remove('hidden');
}

function blockAndReport() {
  document.getElementById('fraudPanel').classList.add('hidden');
  showToast('🛡 Fraud reported! UPI blocked and NPCI notified.', 'green');
  resetSendForm();
}

// ── CASHBACK ──
function showCashbackSuggestion() {
  const strip = document.getElementById('cashbackStrip');
  if (!strip || STATE.sendAmt <= 0) return;
  strip.innerHTML = `
    <div class="cs-title">💎 Best cashback for this payment:</div>
    <div class="cs-options">
      ${CASHBACK_OPTIONS.map(o => `
        <div class="cs-opt ${o.tag === 'best' ? 'best' : ''}" title="${o.note}">
          ${o.tag === 'best' ? '⭐ ' : ''}${o.name} · ${o.cashback}
        </div>
      `).join('')}
    </div>
  `;
  strip.classList.remove('hidden');
}

// ── DWELL TIMER ──
function startDwellTimer() {
  if (STATE.dwellFired || STATE.dwellTimer) return;
  STATE.dwellTimer = setTimeout(() => {
    const amt = parseInt(document.getElementById('sfAmt').value) || 0;
    const name = document.getElementById('sfName').value.trim();
    if (amt > 0 && name && !STATE.dwellFired) {
      STATE.dwellFired = true;
      STATE.splitTotal = amt;
      STATE.splitTo = name;
      showDwellPopup(amt);
    }
  }, 7000);
}

function clearDwellTimer() {
  if (STATE.dwellTimer) { clearTimeout(STATE.dwellTimer); STATE.dwellTimer = null; }
}

function showDwellPopup(amt) {
  // First show copilot thinking
  const thinking = document.getElementById('cpThinking');
  thinking?.classList.remove('hidden');
  setTimeout(() => {
    thinking?.classList.add('hidden');
    const popup = document.getElementById('dwellPopup');
    const dpAmt = document.getElementById('dpAmt');
    if (dpAmt) dpAmt.textContent = '₹' + amt.toLocaleString('en-IN');
    popup?.classList.remove('hidden');
  }, 1800);
}

function closeDwellPopup(split) {
  document.getElementById('dwellPopup')?.classList.add('hidden');
  if (split) {
    STATE.splitTotal = parseInt(document.getElementById('sfAmt').value) || STATE.splitTotal;
    STATE.splitTo = document.getElementById('sfName').value.trim() || STATE.splitTo;
    renderSplitScreen();
    APP.navTo('scrSplit');
  }
}

// ── PAY ──
function initiatePay() {
  const name = document.getElementById('sfName').value.trim();
  const upi  = document.getElementById('sfUPI').value.trim();
  const amt  = parseInt(document.getElementById('sfAmt').value) || 0;
  const note = document.getElementById('sfNote').value.trim();
  if (!name) { showToast('Enter recipient name', 'orange'); return; }
  if (amt <= 0) { showToast('Enter a valid amount', 'orange'); return; }
  if (amt > STATE.walletBalance) { showToast('Insufficient wallet balance', 'red'); return; }
  // Check extreme danger
  const upiVal = upi.toLowerCase();
  const suspicious = SUSPICIOUS_UPI_PATTERNS.some(p => upiVal.includes(p));
  if (amt > 10000 && suspicious) {
    showToast('⚠ This payment is flagged as high risk. Block & Report recommended.', 'red');
    return;
  }
  clearDwellTimer();
  document.getElementById('dwellPopup')?.classList.add('hidden');
  // simulate processing
  const btn = document.getElementById('payBtn');
  if (btn) { btn.textContent = 'Processing...'; btn.disabled = true; }
  setTimeout(() => {
    if (btn) { btn.innerHTML = '<span>Pay Now</span><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'; btn.disabled = false; }
    deductWallet(amt);
    addTransaction({ type: 'debit', name, note: note || 'UPI Transfer', amt, color: CONTACTS.find(c => c.name === name)?.color || '#00b9f1', cat: 'transfer' });
    showSuccessScreen(name, upi, amt, note);
  }, 1200);
}

function showSuccessScreen(name, upi, amt, note) {
  const ss = document.getElementById('successScreen');
  ss.innerHTML = `
    <div class="succ-circle" style="background:var(--success)">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    </div>
    <div class="succ-title">Payment Sent! 🎉</div>
    <div class="succ-sub">₹${amt.toLocaleString('en-IN')} sent to ${name}</div>
    <div class="succ-card">
      <div class="succ-row"><span class="succ-lbl">To</span><span class="succ-val">${name}</span></div>
      ${upi ? `<div class="succ-row"><span class="succ-lbl">UPI</span><span class="succ-val" style="font-size:12px">${upi}</span></div>` : ''}
      <div class="succ-row"><span class="succ-lbl">Amount</span><span class="succ-val" style="color:var(--success)">₹${amt.toLocaleString('en-IN')}</span></div>
      ${note ? `<div class="succ-row"><span class="succ-lbl">Note</span><span class="succ-val">${note}</span></div>` : ''}
      <div class="succ-row"><span class="succ-lbl">Transaction ID</span><span class="succ-val" style="font-size:11px;font-family:'DM Mono',monospace">P${Date.now().toString().slice(-10)}</span></div>
      <div class="succ-row"><span class="succ-lbl">Wallet balance</span><span class="succ-val">₹${STATE.walletBalance.toLocaleString('en-IN')}</span></div>
    </div>
    <div class="cp-bubble" style="width:100%;margin-bottom:12px">
      <div class="cp-hd"><div class="cp-dot"></div><div class="cp-lbl">✦ Copilot</div></div>
      <div class="cp-txt">Payment done! 💙 Wallet updated. ${amt > 200 ? 'Want to add this as a recurring reminder?' : 'Stay safe and pay smart!'}</div>
    </div>
    <button class="succ-done-btn" onclick="APP.navTo('scrHome')">Back to Home</button>
  `;
  APP.navTo('scrSuccess');
}
