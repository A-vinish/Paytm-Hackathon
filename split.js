/* ══════════════════════════════════════════
   split.js
══════════════════════════════════════════ */
function renderSplitScreen() {
  const el = document.getElementById('splitScreen');
  if (!el) return;
  const total = STATE.splitTotal;
  const to = STATE.splitTo;
  const members = CONTACTS.slice(0, 5);
  el.innerHTML = `
    <div class="split-total-card">
      <div class="stc-label">Total Amount</div>
      <div class="stc-amount">₹${total.toLocaleString('en-IN')}</div>
      <div class="stc-to">to ${to}</div>
    </div>
    <div class="split-members-label">Who was with you?</div>
    ${members.map((m, i) => `
      <div class="split-member ${STATE.splitChecked[i] ? 'checked' : ''}" onclick="toggleSplitMember(${i})" id="sm${i}">
        <div class="sm-check ${STATE.splitChecked[i] ? 'on' : ''}" id="smc${i}">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <div class="sm-av" style="background:${m.color}">${m.initial}</div>
        <div class="sm-info">
          <div class="sm-name">${m.name}</div>
          <div class="sm-upi">${m.upi}</div>
        </div>
        <div class="sm-share" id="smamt${i}">₹${calcShare(total, i)}</div>
      </div>
    `).join('')}
    <div class="my-share-box">
      <div class="ms-lbl">Your share (paid now)</div>
      <div class="ms-amt" id="myShareAmt">₹${calcMyShare(total)}</div>
    </div>
    <div class="cp-bubble" style="margin-top:10px">
      <div class="cp-hd"><div class="cp-dot"></div><div class="cp-lbl">✦ Copilot</div></div>
      <div class="cp-txt">I'll send payment requests to the selected friends and remind them in 24hrs if they don't pay 🙂</div>
    </div>
    <button class="split-confirm-btn" onclick="confirmSplit()">✦ Pay my share &amp; notify others</button>
  `;
}

function calcShare(total, idx) {
  const sel = Object.values(STATE.splitChecked).filter(Boolean).length;
  if (!STATE.splitChecked[idx]) return '—';
  return Math.round(total / (sel + 1)).toLocaleString('en-IN');
}

function calcMyShare(total) {
  const sel = Object.values(STATE.splitChecked).filter(Boolean).length;
  const pp = sel > 0 ? Math.round(total / (sel + 1)) : total;
  return (total - pp * sel).toLocaleString('en-IN');
}

function toggleSplitMember(idx) {
  STATE.splitChecked[idx] = !STATE.splitChecked[idx];
  const el = document.getElementById(`sm${idx}`);
  const chk = document.getElementById(`smc${idx}`);
  el?.classList.toggle('checked', STATE.splitChecked[idx]);
  chk?.classList.toggle('on', STATE.splitChecked[idx]);
  // recalc
  const total = STATE.splitTotal;
  const sel = Object.values(STATE.splitChecked).filter(Boolean).length;
  const pp = sel > 0 ? Math.round(total / (sel + 1)) : total;
  CONTACTS.slice(0, 5).forEach((_, i) => {
    const a = document.getElementById(`smamt${i}`);
    if (a) a.textContent = STATE.splitChecked[i] ? '₹' + pp.toLocaleString('en-IN') : '—';
  });
  const ms = document.getElementById('myShareAmt');
  if (ms) ms.textContent = '₹' + calcMyShare(total);
}

function confirmSplit() {
  const total = STATE.splitTotal;
  const sel = Object.values(STATE.splitChecked).filter(Boolean).length;
  const pp = sel > 0 ? Math.round(total / (sel + 1)) : total;
  const myShare = total - pp * sel;
  if (myShare > STATE.walletBalance) { showToast('Insufficient balance', 'red'); return; }
  deductWallet(myShare);
  const pending = CONTACTS.slice(0,5).filter((_, i) => STATE.splitChecked[i]);
  addTransaction({ type:'debit', name: STATE.splitTo, note:`Split: your share`, amt: myShare, color:'#00b9f1', cat:'food' });
  // Add to settle data
  STATE.settleData.unshift({
    group: `${STATE.splitTo} (today)`,
    members: pending.map(m => ({ name: m.name, color: m.color, initial: m.initial, amt: pp, paid: false })),
    messages: [
      { from:'ai', text:`Hey! You owe ₹${pp.toLocaleString('en-IN')} for ${STATE.splitTo}. Please pay when you can 🙂`, time: 'Just now' },
    ]
  });
  showSplitSuccess(myShare, pp, pending, STATE.splitTo);
}

function showSplitSuccess(myShare, pp, pending, to) {
  const ss = document.getElementById('successScreen');
  ss.innerHTML = `
    <div class="succ-circle" style="background:var(--success)">
      <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
    </div>
    <div class="succ-title">Your part done! 🎉</div>
    <div class="succ-sub">₹${myShare.toLocaleString('en-IN')} paid to ${to}</div>
    <div class="succ-card">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
        <span class="succ-lbl">You (${STATE.userName})</span>
        <span style="font-size:13px;font-weight:700;color:var(--success)">✓ Paid ₹${myShare.toLocaleString('en-IN')}</span>
      </div>
      ${pending.map(m => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
          <span class="succ-lbl">${m.name}</span>
          <span style="font-size:13px;font-weight:700;color:var(--warning)">⏳ ₹${pp.toLocaleString('en-IN')} pending</span>
        </div>
      `).join('')}
    </div>
    <div class="cp-bubble" style="width:100%;margin-bottom:12px">
      <div class="cp-hd"><div class="cp-dot"></div><div class="cp-lbl">✦ Copilot</div></div>
      <div class="cp-txt">Messaged ${pending.map(m=>m.name).join(', ')} to pay ₹${pp.toLocaleString('en-IN')} each. I'll remind them in 24hrs if they haven't paid!</div>
    </div>
    <button class="succ-done-btn" onclick="APP.navTo('scrSettle')" style="margin-bottom:8px">View Settle Up →</button>
    <button onclick="APP.navTo('scrHome')" style="width:100%;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;color:var(--t2);font-family:Inter,sans-serif">Back to Home</button>
  `;
  APP.navTo('scrSuccess');
}

/* ══════════════════════════════════════════
   settle.js logic
══════════════════════════════════════════ */
function renderSettle() {
  const el = document.getElementById('settleScreen');
  if (!el) return;
  el.innerHTML = STATE.settleData.map((group, gi) => `
    <div class="settle-group">
      <div class="settle-group-hd">${group.group}</div>
      ${group.members.map((m, mi) => `
        <div class="settle-row">
          <div class="sr-av" style="background:${m.color}">${m.initial}</div>
          <div class="sr-info">
            <div class="sr-name">${m.name}</div>
            <div class="sr-status">${m.paid ? 'Paid back ✓' : 'Owes you'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="sr-amt" style="color:${m.paid ? 'var(--success)' : 'var(--warning)'}">₹${m.amt}</div>
            ${m.paid
              ? `<span class="sr-paid-tag">✓ Paid</span>`
              : `<button class="sr-pend-btn" onclick="markPaid(${gi},${mi})">Remind</button>`
            }
          </div>
        </div>
      `).join('')}
      <div style="background:var(--bg);border-top:1px solid var(--border)">
        <div class="chat-thread">
          ${group.messages.map(msg => `
            <div class="chat-msg ${msg.from === 'me' ? 'from-me' : 'from-other'}">
              ${msg.from === 'ai' ? `
                <div class="chat-sender">✦ Copilot</div>
                <div class="chat-bubble-ai">${msg.text}</div>
              ` : msg.from === 'me' ? `
                <div class="chat-bubble-me">${msg.text}</div>
              ` : `
                <div class="chat-sender">${msg.name || 'Friend'}</div>
                <div class="chat-bubble-them">${msg.text}</div>
              `}
              <div class="chat-time">${msg.time}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('') || `<div style="text-align:center;padding:40px 20px;color:var(--t3)">No pending splits! 🎉</div>`;
}

function markPaid(gi, mi) {
  STATE.settleData[gi].members[mi].paid = true;
  const m = STATE.settleData[gi].members[mi];
  STATE.settleData[gi].messages.push({
    from: 'them', name: m.name,
    text: `Paid ₹${m.amt}! Thanks 🙏`,
    time: 'Just now'
  });
  STATE.walletBalance += m.amt;
  const wd = document.getElementById('walletDisplay');
  if (wd) wd.textContent = '₹' + STATE.walletBalance.toLocaleString('en-IN');
  addTransaction({ type:'credit', name: m.name, note:'Split settlement', amt: m.amt, color: m.color, cat:'transfer' });
  showToast(`✓ Marked ${m.name} as paid! ₹${m.amt} received.`, 'green');
  renderSettle();
}

/* ══════════════════════════════════════════
   voice.js logic
══════════════════════════════════════════ */
let voiceRecog = null;

function startVoice() {
  const strip = document.getElementById('voiceStrip');
  strip?.classList.remove('hidden');
  const vsTxt = document.getElementById('vsTxt');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR && !STATE.micActive) {
    STATE.micActive = true;
    voiceRecog = new SR();
    voiceRecog.lang = STATE.voiceLang === 'en' ? 'en-IN' : STATE.voiceLang === 'hi' ? 'hi-IN' : 'ta-IN';
    voiceRecog.continuous = false;
    voiceRecog.interimResults = false;
    voiceRecog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (vsTxt) vsTxt.textContent = `"${transcript}"`;
      processVoiceCommand(transcript);
      STATE.micActive = false;
    };
    voiceRecog.onerror = () => {
      if (vsTxt) vsTxt.textContent = 'Try a demo phrase below ↓';
      STATE.micActive = false;
      showVoiceDemoPrompt();
    };
    voiceRecog.onend = () => { STATE.micActive = false; };
    voiceRecog.start();
    if (vsTxt) vsTxt.textContent = 'Listening... speak now';
  } else {
    if (vsTxt) vsTxt.textContent = 'Tap a demo phrase ↓';
    showVoiceDemoPrompt();
  }
}

function showVoiceDemoPrompt() {
  const strip = document.getElementById('voiceStrip');
  if (!strip) return;
  const demos = ['Pay Rahul 500', 'Send Priya 1200', 'Pay Deepanshu 250'];
  const existingDemo = document.getElementById('voiceDemoRow');
  if (existingDemo) return;
  const row = document.createElement('div');
  row.id = 'voiceDemoRow';
  row.style.cssText = 'padding:0 16px 12px;display:flex;flex-direction:column;gap:6px;';
  row.innerHTML = `<div style="font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;padding-bottom:2px">Demo phrases:</div>` +
    demos.map(d => `<button onclick="simVoiceCmd('${d}')" style="text-align:left;background:var(--card);border:1.5px solid var(--border);border-radius:10px;padding:9px 12px;font-size:13px;font-weight:600;color:var(--t1);cursor:pointer;font-family:Inter,sans-serif;display:flex;align-items:center;gap:8px;transition:.15s"><span>🎙</span>"${d}"</button>`).join('');
  strip.after(row);
}

function simVoiceCmd(text) {
  document.getElementById('voiceDemoRow')?.remove();
  document.getElementById('voiceStrip')?.classList.add('hidden');
  processVoiceCommand(text);
}

function setLang(lang) {
  STATE.voiceLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function processVoiceCommand(text) {
  const parser = VOICE_COMMANDS[STATE.voiceLang] || VOICE_COMMANDS.en;
  let result = parser.parse(text);
  if (!result.name && !result.amt) {
    // fallback: extract numbers and first capitalized word
    const amtM = text.match(/\d+/);
    const nameM = text.match(/[A-Z][a-z]+/);
    result = { name: nameM ? nameM[0] : null, amt: amtM ? parseInt(amtM[0]) : null };
  }
  if (result.name) {
    const contact = CONTACTS.find(c => c.name.toLowerCase().includes(result.name.toLowerCase()));
    if (contact) {
      document.getElementById('sfName').value = contact.name;
      document.getElementById('sfUPI').value = contact.upi;
      checkUPIRep(contact.upi);
    } else {
      document.getElementById('sfName').value = result.name.charAt(0).toUpperCase() + result.name.slice(1);
    }
  }
  if (result.amt) {
    document.getElementById('sfAmt').value = result.amt;
    onAmtInput();
    showCashbackSuggestion();
  }
  showToast(`🎙 Voice: "${text}" → filled the form!`, 'blue');
}

/* ══════════════════════════════════════════
   insights.js logic
══════════════════════════════════════════ */
function renderInsights() {
  const el = document.getElementById('insightsScreen');
  if (!el) return;
  const d = SPENDING_DATA[STATE.insightsPeriod];
  const max = Math.max(...d.values);
  const barColors = ['#00b9f1','#7c3aed','#e02020','var(--warning)','var(--success-d)','#00b9f1','#7c3aed'];
  const change = ((d.total - d.prevTotal) / d.prevTotal * 100).toFixed(0);
  const up = d.total > d.prevTotal;
  el.innerHTML = `
    <div class="ins-period-tabs">
      <button class="ipt ${STATE.insightsPeriod==='week'?'on':''}" onclick="switchInsightsPeriod('week')">This Week</button>
      <button class="ipt ${STATE.insightsPeriod==='month'?'on':''}" onclick="switchInsightsPeriod('month')">This Month</button>
    </div>
    <div class="ins-total-card">
      <div class="itc-lbl">Total Spent</div>
      <div class="itc-amt">₹${d.total.toLocaleString('en-IN')}</div>
      <span class="itc-change ${up?'itc-up':'itc-down'}">${up?'↑':'↓'} ${Math.abs(change)}% vs last ${STATE.insightsPeriod}</span>
    </div>
    <div class="ins-chart">
      <div class="ins-chart-title">Daily Spending</div>
      <div class="bar-chart">
        ${d.values.map((v,i) => `
          <div class="bc-col">
            <div class="bc-val" style="font-size:9px;color:var(--t3)">${v>0?'₹'+(v>=1000?(v/1000).toFixed(1)+'k':v):''}</div>
            <div class="bc-bar" style="height:${max>0?Math.round((v/max)*80)+4:4}px;background:${v>0?barColors[i]:'var(--border)'}"></div>
            <div class="bc-lbl">${d.labels[i]}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="ins-cat">
      <div class="ins-cat-title">By Category</div>
      ${d.categories.map(c => `
        <div class="cat-row">
          <div class="cat-row-hd">
            <div class="cat-row-name"><span>${c.icon}</span> ${c.name}</div>
            <div>
              <div class="cat-row-amt">₹${c.amt.toLocaleString('en-IN')}</div>
              <div class="cat-pct" style="text-align:right">${c.pct}%</div>
            </div>
          </div>
          <div class="cat-bar"><div class="cat-bar-fill" style="width:${c.pct}%;background:${c.color}"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="copilot-tip">
      <div class="ct-hd"><div class="ct-hd-dot"></div><div class="ct-hd-lbl">✦ Copilot Insight</div></div>
      <div class="ct-body">${d.tip}</div>
    </div>
  `;
}

function switchInsightsPeriod(p) {
  STATE.insightsPeriod = p;
  renderInsights();
}

/* ══════════════════════════════════════════
   reminders.js logic
══════════════════════════════════════════ */
function renderRemindersHome() {
  const el = document.getElementById('remindersHome');
  if (!el) return;
  const today = new Date().getDate();
  const visible = STATE.bills.slice(0, 3);
  el.innerHTML = visible.map(b => {
    const rem = b.total - b.paid;
    const daysLeft = b.dueDay - today;
    const isOverdue = daysLeft < 0;
    const isSoon = daysLeft >= 0 && daysLeft <= 3;
    const isPaid = rem <= 0;
    const cls = isPaid ? 'rem-card-paid' : isOverdue ? 'rem-card-overdue' : isSoon ? 'rem-card-soon' : 'rem-card-ok';
    const stCls = isPaid ? 'rs-paid' : isOverdue ? 'rs-overdue' : isSoon ? 'rs-soon' : 'rs-ok';
    const stTxt = isPaid ? 'Paid ✓' : isOverdue ? `Overdue ${Math.abs(daysLeft)}d` : isSoon ? `Due in ${daysLeft}d` : `Due ${b.dueDay} Apr`;
    const pct = Math.round((b.paid / b.total) * 100);
    const barColor = isOverdue ? 'var(--danger)' : isSoon ? 'var(--warning)' : 'var(--success)';
    return `
      <div class="rem-card ${cls}">
        <div class="rem-top">
          <div class="rem-name">${b.icon} ${b.name}</div>
          <div class="rem-status ${stCls}">${stTxt}</div>
        </div>
        <div class="rem-amt">₹${rem.toLocaleString('en-IN')} <span style="font-size:12px;color:var(--t3);font-weight:500">of ₹${b.total.toLocaleString('en-IN')}</span></div>
        <div class="rem-due">Due: ${b.dueDay} April 2025</div>
        <div class="rem-progress"><div class="rem-prog-fill" style="width:${pct}%;background:${barColor}"></div></div>
        ${!isPaid ? `
          <div class="rem-pay-row">
            <input class="rem-pay-input" type="number" placeholder="Pay amount..." id="rpay_${b.id}" oninput="previewRemPay('${b.id}',${b.total})" />
            <button class="rem-pay-btn" onclick="payBill('${b.id}')">Pay</button>
          </div>
        ` : '<div style="font-size:12px;color:var(--success);font-weight:700">✓ All paid this month</div>'}
      </div>
    `;
  }).join('');
}

function previewRemPay(id, total) {
  const val = parseInt(document.getElementById(`rpay_${id}`)?.value) || 0;
  const bill = STATE.bills.find(b => b.id === id);
  if (!bill) return;
  const rem = total - bill.paid - val;
}

function payBill(id) {
  const input = document.getElementById(`rpay_${id}`);
  const val = parseInt(input?.value) || 0;
  if (!val) { showToast('Enter amount first', 'orange'); return; }
  const bill = STATE.bills.find(b => b.id === id);
  if (!bill) return;
  const maxPay = bill.total - bill.paid;
  const paying = Math.min(val, maxPay);
  if (paying > STATE.walletBalance) { showToast('Insufficient balance', 'red'); return; }
  bill.paid += paying;
  deductWallet(paying);
  addTransaction({ type:'debit', name: bill.name, note:'Bill payment', amt: paying, color: '#e02020', cat:'bills' });
  showToast(`✓ ₹${paying.toLocaleString('en-IN')} paid to ${bill.name}!`, 'green');
  renderRemindersHome();
}

/* ══════════════════════════════════════════
   calendar.js logic
══════════════════════════════════════════ */
function renderCalendar() {
  const el = document.getElementById('calendarScreen');
  if (!el) return;
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const billDays = {};
  STATE.bills.forEach(b => {
    if (!billDays[b.dueDay]) billDays[b.dueDay] = [];
    billDays[b.dueDay].push(b);
  });
  const dayHeaders = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let gridCells = dayHeaders.map(d => `<div class="cal-day-hd">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) gridCells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const bills = billDays[d] || [];
    const isToday = d === today;
    const hasBill = bills.length > 0;
    const dotColor = bills[0] ? (d < today ? 'var(--danger)' : d - today <= 3 ? 'var(--warning)' : 'var(--success)') : '';
    gridCells += `
      <div class="cal-day ${isToday ? 'today' : ''}" onclick="showCalDay(${d})">
        ${d}
        ${hasBill ? `<div class="cal-day-dot" style="background:${dotColor}"></div>` : ''}
      </div>`;
  }
  el.innerHTML = `
    <div class="cal-month-nav">
      <button class="cal-nav-btn">‹</button>
      <div class="cal-month">${monthNames[month]} ${year}</div>
      <button class="cal-nav-btn">›</button>
    </div>
    <div class="cal-grid">${gridCells}</div>
    <div style="font-size:11px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">All Bills This Month</div>
    <div class="cal-bills-list">
      ${STATE.bills.map(b => {
        const rem = b.total - b.paid;
        const daysLeft = b.dueDay - today;
        const isOverdue = daysLeft < 0;
        const borderColor = rem <= 0 ? 'var(--txt4)' : isOverdue ? 'var(--danger)' : daysLeft <= 3 ? 'var(--warning)' : 'var(--success)';
        const amtColor = rem <= 0 ? 'var(--t3)' : isOverdue ? 'var(--danger)' : daysLeft <= 3 ? 'var(--warning)' : 'var(--success)';
        return `
          <div class="cal-bill-item" style="border-left-color:${borderColor}">
            <div class="cbi-icon">${b.icon}</div>
            <div class="cbi-info">
              <div class="cbi-name">${b.name}</div>
              <div class="cbi-due">Due: ${b.dueDay} April 2025 ${rem<=0?'· Paid ✓':isOverdue?`· Overdue ${Math.abs(daysLeft)}d`:daysLeft<=3?`· Due soon!`:''}</div>
            </div>
            <div class="cbi-amt" style="color:${amtColor}">₹${rem.toLocaleString('en-IN')}</div>
          </div>`;
      }).join('')}
    </div>
  `;
}

function showCalDay(d) {
  const bills = STATE.bills.filter(b => b.dueDay === d);
  if (bills.length > 0) showToast(`${bills.map(b=>b.icon+' '+b.name).join(', ')} due on ${d} Apr`, 'orange');
}

/* ══════════════════════════════════════════
   history.js logic
══════════════════════════════════════════ */
function renderHistory() {
  const el = document.getElementById('historyScreen');
  if (!el) return;
  const cats = ['All','Food','Bills','Shopping','Transfer'];
  el.innerHTML = `
    <div class="hist-filter">
      ${cats.map((c,i) => `<button class="hf-btn ${i===0?'on':''}" onclick="filterHistory('${c}',this)">${c}</button>`).join('')}
    </div>
    <div id="histList"></div>`;
  renderHistList('All');
}

function filterHistory(cat, btn) {
  document.querySelectorAll('.hf-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderHistList(cat);
}

function renderHistList(cat) {
  const el = document.getElementById('histList');
  if (!el) return;
  const txns = cat === 'All' ? STATE.transactions : STATE.transactions.filter(t => t.cat && t.cat.toLowerCase().includes(cat.toLowerCase()));
  // group by time
  const groups = {};
  txns.forEach(t => {
    const g = t.time.includes('ago') || t.time === 'Just now' ? 'Today' : t.time === 'Yesterday' ? 'Yesterday' : 'Earlier';
    if (!groups[g]) groups[g] = [];
    groups[g].push(t);
  });
  el.innerHTML = Object.entries(groups).map(([label, ts]) => `
    <div class="hist-section-label">${label}</div>
    <div style="background:var(--card)">
      ${ts.map(t => `
        <div class="txn-item">
          <div class="txn-avatar" style="background:${t.color}">${t.name[0]}</div>
          <div class="txn-info">
            <div class="txn-name">${t.name}</div>
            <div class="txn-note">${t.note}</div>
          </div>
          <div class="txn-amt">
            <div class="txn-amt-val ${t.type==='debit'?'txn-debit':'txn-credit'}">${t.type==='debit'?'−':'+'}₹${t.amt.toLocaleString('en-IN')}</div>
            <div class="txn-time">${t.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('') || `<div style="text-align:center;padding:40px;color:var(--t3)">No transactions found</div>`;
}
