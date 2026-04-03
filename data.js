/* ══════════════════════════════════════════
   data.js — All app data
══════════════════════════════════════════ */

const CONTACTS = [
  { name: 'Rahul Mehta',   upi: 'rahul.mehta@paytm', color: '#7c3aed', initial: 'R' },
  { name: 'Priya Kapoor',  upi: 'priya.k@paytm',     color: '#e02020', initial: 'P' },
  { name: 'Deepanshu Meena',    upi: 'deepanshu.a@paytm',     color: '#00a86b', initial: 'S' },
  { name: 'Nisha Verma',   upi: 'nisha.v@paytm',      color: '#ff7c00', initial: 'N' },
  { name: 'Deepak Rao',    upi: 'deepak.r@paytm',     color: '#00b9f1', initial: 'D' },
  { name: 'Anjali Singh',  upi: 'anjali.s@paytm',     color: '#e91e8c', initial: 'A' },
  { name: 'Vikas Joshi',   upi: 'vikas.j@paytm',      color: '#795548', initial: 'V' },
];

const KNOWN_UPI = {
  'rahul.mehta@paytm': { users: 4821, age: '3 years 2 months', location: 'Mumbai, MH', score: 94 },
  'priya.k@paytm':     { users: 2190, age: '1 year 8 months',  location: 'Delhi, DL',  score: 88 },
  'deepanshu.a@paytm':    { users: 3340, age: '2 years 1 month',   location: 'Bangalore, KA', score: 91 },
  'nisha.v@paytm':     { users: 1205, age: '11 months',        location: 'Chennai, TN', score: 78 },
  'deepak.r@paytm':    { users: 5672, age: '4 years',          location: 'Hyderabad, TS', score: 97 },
};

const SUSPICIOUS_UPI_PATTERNS = [
  'kyc', 'help', 'support', 'verify', 'paytm-', 'neft', 'bank-',
  'refund', 'prize', 'winner', 'official', '1ndia', 'pay-tm',
];

const BILLS = [
  { id: 'jio',   name: 'Jio Postpaid',    icon: '📱', total: 849,  paid: 0, dueDay: 5,  category: 'telecom' },
  { id: 'elec',  name: 'Electricity',     icon: '⚡', total: 1420, paid: 0, dueDay: 28, category: 'utility' },
  { id: 'broad', name: 'ACT Broadband',   icon: '🌐', total: 699,  paid: 0, dueDay: 12, category: 'internet' },
  { id: 'rent',  name: 'Rent',            icon: '🏠', total: 18000,paid: 0, dueDay: 1,  category: 'rent' },
  { id: 'ott',   name: 'Netflix + Prime', icon: '🎬', total: 649,  paid: 649, dueDay: 18, category: 'entertainment' },
  { id: 'gym',   name: 'Gym Membership',  icon: '🏋️', total: 1200, paid: 0, dueDay: 10, category: 'health' },
];

const INITIAL_TRANSACTIONS = [
  { id: 1, type: 'debit',  name: 'Rahul Mehta',   note: 'Dinner split',     amt: 450,  time: '2h ago',   color: '#7c3aed', cat: 'food' },
  { id: 2, type: 'credit', name: 'Deepanshu Meena',    note: 'Movie tickets',    amt: 360,  time: '5h ago',   color: '#00a86b', cat: 'entertainment' },
  { id: 3, type: 'debit',  name: 'Jio Postpaid',  note: 'Bill payment',     amt: 849,  time: 'Yesterday',color: '#e02020', cat: 'telecom' },
  { id: 4, type: 'debit',  name: 'Priya Kapoor',  note: 'Birthday gift',    amt: 500,  time: 'Yesterday',color: '#e02020', cat: 'shopping' },
  { id: 5, type: 'credit', name: 'Nisha Verma',   note: 'Cab share',        amt: 120,  time: '2 days ago',color: '#ff7c00', cat: 'transport' },
  { id: 6, type: 'debit',  name: 'Swiggy',        note: 'Food order',       amt: 380,  time: '2 days ago',color: '#ff7c00', cat: 'food' },
  { id: 7, type: 'debit',  name: 'Amazon',        note: 'Shopping',         amt: 1299, time: '3 days ago',color: '#ff9900', cat: 'shopping' },
  { id: 8, type: 'credit', name: 'Deepak Rao',    note: 'Lent return',      amt: 800,  time: '4 days ago',color: '#00b9f1', cat: 'transfer' },
];

const SPENDING_DATA = {
  week: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    values: [320, 0, 849, 500, 660, 1299, 380],
    total: 4008,
    prevTotal: 2890,
    categories: [
      { name: 'Food & Dining', icon: '🍕', amt: 760, pct: 19, color: '#ff7c00' },
      { name: 'Bills',         icon: '⚡', amt: 849, pct: 21, color: '#e02020' },
      { name: 'Shopping',      icon: '🛍', amt: 1799,pct: 45, color: '#7c3aed' },
      { name: 'Transport',     icon: '🚗', amt: 200, pct: 5,  color: '#00b9f1' },
      { name: 'Entertainment', icon: '🎬', amt: 400, pct: 10, color: '#00a86b' },
    ],
    tip: 'You spent <strong>39% more</strong> than last week. Shopping is your biggest category this week.',
  },
  month: {
    labels: ['W1','W2','W3','W4'],
    values: [3200, 4500, 2890, 4008],
    total: 14598,
    prevTotal: 12400,
    categories: [
      { name: 'Food & Dining', icon: '🍕', amt: 3200, pct: 22, color: '#ff7c00' },
      { name: 'Bills',         icon: '⚡', amt: 4200, pct: 29, color: '#e02020' },
      { name: 'Shopping',      icon: '🛍', amt: 3800, pct: 26, color: '#7c3aed' },
      { name: 'Transport',     icon: '🚗', amt: 1400, pct: 10, color: '#00b9f1' },
      { name: 'Entertainment', icon: '🎬', amt: 1998, pct: 13, color: '#00a86b' },
    ],
    tip: 'Bills &amp; subscriptions are <strong>₹4,200 this month</strong>. Consider reviewing recurring payments.',
  },
};

const CASHBACK_OPTIONS = [
  { name: 'Paytm Wallet', cashback: '2%', tag: 'best', note: 'Max ₹50' },
  { name: 'Axis CC',      cashback: '1.5%', tag: '', note: 'No cap' },
  { name: 'HDFC Debit',   cashback: '0.5%', tag: '', note: 'Max ₹20' },
];

const NOTIFICATIONS = [
  { icon: '⚡', bg: '#fff4e6', title: 'Electricity bill overdue!', body: '₹1,420 due since 28 Feb. Pay now to avoid late fee.', time: '10 min ago', action: () => APP.navTo('scrCalendar') },
  { icon: '🔐', bg: '#ffeaea', title: 'New login detected', body: 'Someone logged in from iPhone 15, Mumbai. Tap to verify.', time: '2 hours ago', action: () => APP.showSecurityAlert() },
  { icon: '💸', bg: '#e8f5ff', title: 'Rahul owes you ₹300', body: 'From Barbeque Nation dinner split on 1st March. Send reminder?', time: 'Yesterday', action: () => APP.navTo('scrSettle') },
];

const VOICE_COMMANDS = {
  en: {
    patterns: [
      /pay\s+(\w+)\s+(\d+)/i,
      /send\s+(\w+)\s+(\d+)/i,
      /send\s+(\d+)\s+to\s+(\w+)/i,
      /transfer\s+(\d+)\s+to\s+(\w+)/i,
    ],
    parse: (text) => {
      const t = text.toLowerCase();
      let name = null, amt = null;
      const m1 = t.match(/(?:pay|send)\s+(\w+)\s+(\d+)/);
      const m2 = t.match(/(?:send|transfer)\s+(\d+)\s+to\s+(\w+)/);
      if (m1) { name = m1[1]; amt = parseInt(m1[2]); }
      else if (m2) { amt = parseInt(m2[1]); name = m2[2]; }
      return { name, amt };
    }
  },
  hi: {
    examples: ['Rahul ko paanch sau bhejo', 'Priya ko ek hazaar do'],
    parse: (text) => {
      const nums = { 'ek':1,'do':2,'teen':3,'char':4,'paanch':5,'chhe':6,'saat':7,'aath':8,'nau':9,'das':10,'bees':20,'pachaas':50,'sau':100,'hazaar':1000 };
      const t = text.toLowerCase();
      let name = null, amt = null;
      const nameMatch = t.match(/(\w+)\s+ko/);
      if (nameMatch) name = nameMatch[1];
      let total = 0;
      Object.entries(nums).forEach(([w,v]) => { if(t.includes(w)) total += v; });
      if (total > 0) amt = total;
      return { name, amt };
    }
  },
  ta: {
    examples: ['Rahulukku ainnuru kodu', 'Priyavukku patthu nuru kodu'],
    parse: (text) => {
      const t = text.toLowerCase();
      let name = null, amt = null;
      const nameMatch = t.match(/(\w+)ukku/);
      if (nameMatch) name = nameMatch[1];
      const amtMatch = text.match(/\d+/);
      if (amtMatch) amt = parseInt(amtMatch[0]);
      return { name, amt };
    }
  }
};

const SETTLE_DATA = [
  {
    group: 'Barbeque Nation (Mar 1)',
    members: [
      { name: 'Rahul Mehta',  color: '#7c3aed', initial: 'R', amt: 300, paid: false },
      { name: 'Priya Kapoor', color: '#e02020', initial: 'P', amt: 300, paid: true  },
    ],
    messages: [
      { from: 'ai',   text: 'Hey Rahul! You owe ₹300 for Barbeque Nation dinner from March 1st. Please pay when you can 🙂', time: '1 Mar, 9:30 PM' },
      { from: 'them', name: 'Rahul', text: 'Yaar will do it by tomorrow 😅', time: '1 Mar, 11:00 PM' },
      { from: 'ai',   text: 'Reminder: ₹300 still pending from Rahul for Barbeque Nation. Due 2 days ago.', time: '3 Mar, 10:00 AM' },
    ]
  }
];
