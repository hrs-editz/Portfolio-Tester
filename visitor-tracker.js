/* ================================================================
   HARIHARAN R — PORTFOLIO  |  visitor-tracker.js
   Mandatory Google Sign-In Gate + Profile Chip + Admin Visitors Tab
   ✅ Firebase Firestore — visitors stored server-side (all devices)
================================================================ */

const GOOGLE_CLIENT_ID    = '633973864394-r0h9go0n37rj9ihog3johihinvs1751r.apps.googleusercontent.com';
const VISITOR_STORAGE_KEY = 'hrs_visitors';   // kept for local cache fallback
const SIGNED_IN_KEY       = 'hrs_signed_in_user';

/* ── FIREBASE CONFIG ──────────────────────────────────────────
   🔧 REPLACE these values with your own Firebase project config.
   Steps:
   1. Go to https://console.firebase.google.com/
   2. Create a project (or open existing one)
   3. Click ⚙️ Project Settings → "Your apps" → Add Web App
   4. Copy the firebaseConfig object values below
   5. In Firestore → Rules, set:
        allow read, write: if true;   ← for now (tighten later)
──────────────────────────────────────────────────────────────*/
const firebaseConfig = {
  apiKey: "AIzaSyBX7fB1VjxiXwsxi84ef6mJAa5L0rD06mM",
  authDomain: "hrs-editz-counter.firebaseapp.com",
  projectId: "hrs-editz-counter",
  storageBucket: "hrs-editz-counter.firebasestorage.app",
  messagingSenderId: "123122757550",
  appId: "1:123122757550:web:45790ce5c6e8b18d5ae23f"
};


const FIRESTORE_COLLECTION = 'portfolio_visitors'; // Firestore collection name

/* ── FIREBASE LOADER ──────────────────────────────────────────*/
var _db = null;   // Firestore instance, set after SDK loads

function loadFirebase(callback) {
  if (_db) { callback(_db); return; }
  // Check if already loaded
  if (window.firebase && window.firebase.firestore) {
    _db = firebase.firestore();
    callback(_db);
    return;
  }
  // Load Firebase SDKs dynamically
  function loadScript(src, next) {
    var s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = next;
    s.onerror = function() { console.warn('[Visitor Tracker] Failed to load', src); };
    document.head.appendChild(s);
  }
  loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js', function() {
    loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js', function() {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        _db = firebase.firestore();
        callback(_db);
      } catch(e) {
        console.error('[Visitor Tracker] Firebase init failed:', e);
      }
    });
  });
}

/* ── DATA HELPERS (local cache) ───────────────────────────────*/
function getVisitorsLocal() {
  try { return JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveVisitorsLocal(arr) {
  try { localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(arr)); } catch(e) {}
}

// Fetch all visitors from Firestore and cache locally
function getVisitors(callback) {
  loadFirebase(function(db) {
    db.collection(FIRESTORE_COLLECTION)
      .orderBy('time', 'desc')
      .limit(500)
      .get()
      .then(function(snapshot) {
        var visitors = [];
        snapshot.forEach(function(doc) { visitors.push(doc.data()); });
        saveVisitorsLocal(visitors);   // update local cache
        callback(visitors);
      })
      .catch(function(err) {
        console.warn('[Visitor Tracker] Firestore read failed, using local cache:', err);
        callback(getVisitorsLocal());
      });
  });
}

// Save visitors now just writes to Firestore (local cache updated by getVisitors)
function saveVisitors(arr) {
  saveVisitorsLocal(arr); // keep local in sync for offline fallback
}
function getSignedInUser() {
  try { return JSON.parse(localStorage.getItem(SIGNED_IN_KEY) || 'null'); }
  catch(e) { return null; }
}
function setSignedInUser(profile) {
  try { localStorage.setItem(SIGNED_IN_KEY, JSON.stringify(profile)); } catch(e) {}
}
function clearSignedInUser() {
  try { localStorage.removeItem(SIGNED_IN_KEY); } catch(e) {}
}

function recordVisitor(profile) {
  var ua = navigator.userAgent;
  var device  = /Mobi|Android/i.test(ua) ? '📱 Mobile' :
                /Tablet|iPad/i.test(ua)   ? '📲 Tablet' : '🖥️ Desktop';
  var browser = /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' :
                /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Other';

  loadFirebase(function(db) {
    var docId = profile.email.replace(/[@.]/g, '_');
    var docRef = db.collection(FIRESTORE_COLLECTION).doc(docId);
    docRef.get().then(function(docSnap) {
      if (!docSnap.exists) {
        return docRef.set({
          name:    profile.name    || 'Unknown',
          email:   profile.email   || '—',
          picture: profile.picture || '',
          time:    new Date().toISOString(),
          device:  device,
          browser: browser,
          ref:     document.referrer || 'Direct',
          visits:  1
        });
      } else {
        var data = docSnap.data();
        return docRef.update({
          visits:   (data.visits || 1) + 1,
          lastSeen: new Date().toISOString(),
          picture:  profile.picture || data.picture || ''
        });
      }
    }).catch(function(err) {
      console.warn('[Visitor Tracker] Firestore write failed, using localStorage fallback:', err);
      var visitors = getVisitorsLocal();
      var existing = visitors.find(function(v) { return v.email === profile.email; });
      if (!existing) {
        visitors.unshift({ name: profile.name||'Unknown', email: profile.email||'—',
          picture: profile.picture||'', time: new Date().toISOString(),
          device: device, browser: browser, ref: document.referrer||'Direct', visits: 1 });
        if (visitors.length > 500) visitors = visitors.slice(0, 500);
      } else {
        visitors = visitors.map(function(v) {
          if (v.email === profile.email) { v.visits=(v.visits||1)+1; v.lastSeen=new Date().toISOString(); }
          return v;
        });
      }
      saveVisitorsLocal(visitors);
    });
  });
}

/* ── ALL STYLES ───────────────────────────────────────────────*/
function injectStyles() {
  if (document.getElementById('hrs-gate-styles')) return;
  var s = document.createElement('style');
  s.id = 'hrs-gate-styles';
  s.textContent = `

  /* ══════════════════════════════════════
     SIGN-IN GATE
  ══════════════════════════════════════ */
  #hrs-signin-gate {
    position: fixed; inset: 0; z-index: 99990;
    background: #0a0a0a;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column;
    opacity: 0; transition: opacity 0.5s ease; overflow: hidden;
  }
  #hrs-signin-gate.visible { opacity: 1; }
  /* Keep custom cursor above gate */
  #cursor-dot, #cursor-ring { z-index: 999999 !important; }
  #hrs-signin-gate.hiding  { opacity: 0; pointer-events: none; }
  #hrs-signin-gate::before {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(232,197,71,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,197,71,0.04) 1px, transparent 1px);
    background-size: 48px 48px; pointer-events: none;
  }
  .hrs-gate-card {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(232,197,71,0.2);
    border-radius: 14px; padding: 2.8rem 2.5rem 2.2rem;
    max-width: 420px; width: calc(100% - 3rem); text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,197,71,0.06);
  }
  .hrs-gate-logo {
    width: 68px; height: 68px; border-radius: 50%;
    background: rgba(232,197,71,0.08); border: 2px solid rgba(232,197,71,0.28);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.3rem; font-size: 2rem; overflow: hidden;
  }
  .hrs-gate-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .hrs-gate-eyebrow {
    font-family: var(--font-mono, monospace); font-size: 0.7rem;
    letter-spacing: 0.14em; color: var(--accent, #e8c547);
    text-transform: uppercase; margin-bottom: 0.5rem;
  }
  .hrs-gate-title {
    font-family: var(--font-heading, serif); font-size: 1.6rem;
    font-weight: 700; color: #fff; margin-bottom: 0.55rem; line-height: 1.2;
  }
  .hrs-gate-sub {
    font-family: var(--font-body, sans-serif); font-size: 0.83rem;
    color: rgba(255,255,255,0.42); line-height: 1.65; margin-bottom: 1.8rem;
  }
  .hrs-gate-sub strong { color: rgba(255,255,255,0.72); }
  .hrs-gate-divider {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.3rem;
  }
  .hrs-gate-divider span { flex:1; height:1px; background:rgba(255,255,255,0.07); }
  .hrs-gate-divider em {
    font-style: normal; font-family: var(--font-mono, monospace);
    font-size: 0.62rem; color: rgba(255,255,255,0.22); letter-spacing: 0.08em;
  }
  #hrs-gate-google-btn { display: flex; justify-content: center; margin-bottom: 1.1rem; }
  .hrs-gate-privacy {
    font-family: var(--font-mono, monospace); font-size: 0.62rem;
    color: rgba(255,255,255,0.18); line-height: 1.7; margin-top: 0.4rem;
  }

  /* Gate success state */
  #hrs-gate-success { display: none; flex-direction: column; align-items: center; gap: 0.75rem; }
  #hrs-gate-success.show { display: flex; }
  .hrs-gate-s-avatar {
    width: 58px; height: 58px; border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(232,197,71,0.45);
  }
  .hrs-gate-s-name { font-family: var(--font-body, sans-serif); font-size: 1rem; font-weight: 600; color: #fff; }
  .hrs-gate-s-msg  { font-family: var(--font-mono, monospace); font-size: 0.74rem; color: var(--accent, #e8c547); letter-spacing: 0.06em; }
  .hrs-gate-enter-btn {
    margin-top: 0.3rem; background: var(--accent, #e8c547); color: #000;
    border: none; padding: 0.75rem 2.2rem; border-radius: 4px;
    font-family: var(--font-mono, monospace); font-size: 0.82rem;
    font-weight: 700; letter-spacing: 0.08em; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .hrs-gate-enter-btn:hover { background: #f5d76e; transform: translateY(-1px); }

  /* ══════════════════════════════════════
     HEADER PROFILE CHIP
  ══════════════════════════════════════ */
  #hrs-profile-chip {
    display: none;          /* shown by JS after sign-in */
    align-items: center;
    gap: 0px;
    position: relative;
    cursor: pointer;
    user-select: none;
  }
  #hrs-profile-chip.ready { display: flex; }

  .hrs-chip-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(232,197,71,0.45);
    flex-shrink: 0;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  #hrs-profile-chip:hover .hrs-chip-avatar {
    border-color: var(--accent, #e8c547);
    box-shadow: 0 0 0 3px rgba(232,197,71,0.18);
  }
  .hrs-chip-caret {
    width: 14px; height: 14px; margin-left: 4px; opacity: 0.5;
    transition: transform 0.2s;
  }
  #hrs-profile-chip.open .hrs-chip-caret { transform: rotate(180deg); opacity: 0.8; }

  /* Dropdown */
  .hrs-chip-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 230px;
    background: #161616;
    border: 1px solid rgba(232,197,71,0.18);
    border-radius: 10px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04);
    opacity: 0; pointer-events: none;
    transform: translateY(-6px) scale(0.97);
    transform-origin: top right;
    transition: opacity 0.18s ease, transform 0.18s ease;
    z-index: 99999;
    overflow: hidden;
  }
  #hrs-profile-chip.open .hrs-chip-dropdown {
    opacity: 1; pointer-events: all; transform: translateY(0) scale(1);
  }

  .hrs-dd-header {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 1rem 1rem 0.85rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .hrs-dd-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    object-fit: cover; border: 2px solid rgba(232,197,71,0.35); flex-shrink: 0;
  }
  .hrs-dd-avatar-placeholder {
    width: 42px; height: 42px; border-radius: 50%;
    background: rgba(232,197,71,0.1); border: 2px solid rgba(232,197,71,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .hrs-dd-info { flex: 1; min-width: 0; }
  .hrs-dd-name {
    font-family: var(--font-body, sans-serif); font-size: 0.85rem;
    font-weight: 600; color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hrs-dd-email {
    font-family: var(--font-mono, monospace); font-size: 0.68rem;
    color: rgba(255,255,255,0.38); margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hrs-dd-badge {
    font-family: var(--font-mono, monospace); font-size: 0.58rem;
    background: rgba(46,204,113,0.15); border: 1px solid rgba(46,204,113,0.3);
    color: #2ecc71; padding: 0.15rem 0.45rem; border-radius: 20px;
    letter-spacing: 0.04em; white-space: nowrap; margin-top: 4px; display: inline-block;
  }

  .hrs-dd-body { padding: 0.4rem 0; }
  .hrs-dd-item {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.65rem 1rem; cursor: pointer;
    font-family: var(--font-body, sans-serif); font-size: 0.82rem;
    color: rgba(255,255,255,0.65);
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
  }
  .hrs-dd-item:hover { background: rgba(255,255,255,0.04); color: #fff; }
  .hrs-dd-item svg { flex-shrink: 0; opacity: 0.55; }
  .hrs-dd-item:hover svg { opacity: 0.9; }
  .hrs-dd-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 0.25rem 0; }
  .hrs-dd-signout {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.65rem 1rem; cursor: pointer;
    font-family: var(--font-body, sans-serif); font-size: 0.82rem;
    color: rgba(231,76,60,0.75);
    transition: background 0.15s, color 0.15s;
  }
  .hrs-dd-signout:hover { background: rgba(231,76,60,0.07); color: #e74c3c; }
  .hrs-dd-signout svg { flex-shrink: 0; opacity: 0.7; }

  .hrs-dd-footer {
    padding: 0.55rem 1rem;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-family: var(--font-mono, monospace); font-size: 0.6rem;
    color: rgba(255,255,255,0.18); text-align: center;
  }

  /* ══════════════════════════════════════
     ADMIN VISITORS TAB
  ══════════════════════════════════════ */
  .vis-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .vis-header h3 {
    font-family: var(--font-mono, monospace); font-size: 0.85rem;
    color: var(--accent, #e8c547); letter-spacing: 0.08em; margin: 0;
  }
  .vis-count-badge {
    background: rgba(232,197,71,0.12); border: 1px solid rgba(232,197,71,0.25);
    color: var(--accent, #e8c547); font-family: var(--font-mono, monospace);
    font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 20px;
  }
  .vis-clear-btn {
    background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.3);
    color: #e74c3c; font-family: var(--font-mono, monospace);
    font-size: 0.72rem; padding: 0.35rem 0.85rem; border-radius: 3px;
    cursor: pointer; transition: all 0.2s;
  }
  .vis-clear-btn:hover { background: rgba(231,76,60,0.2); }
  .vis-note {
    padding: 0.75rem 1.5rem; background: rgba(232,197,71,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-family: var(--font-mono, monospace); font-size: 0.72rem;
    color: rgba(255,255,255,0.32); line-height: 1.6;
  }
  .vis-list {
    padding: 1rem 1.5rem; display: flex; flex-direction: column;
    gap: 0.75rem; max-height: 58vh; overflow-y: auto;
  }
  .vis-card {
    display: flex; align-items: center; gap: 1rem;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px; padding: 0.9rem 1rem; transition: border-color 0.2s;
  }
  .vis-card:hover { border-color: rgba(232,197,71,0.22); }
  .vis-avatar {
    width: 42px; height: 42px; border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(232,197,71,0.3); flex-shrink: 0;
  }
  .vis-avatar-ph {
    width: 42px; height: 42px; border-radius: 50%;
    background: rgba(232,197,71,0.1); border: 2px solid rgba(232,197,71,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .vis-info { flex: 1; min-width: 0; }
  .vis-name {
    font-family: var(--font-body, sans-serif); font-size: 0.88rem;
    color: #fff; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .vis-email {
    font-family: var(--font-mono, monospace); font-size: 0.72rem;
    color: var(--accent, #e8c547); margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .vis-meta {
    font-family: var(--font-mono, monospace); font-size: 0.67rem;
    color: rgba(255,255,255,0.3); margin-top: 4px;
    display: flex; flex-wrap: wrap; gap: 0.5rem;
  }
  .vis-right {
    display: flex; flex-direction: column;
    align-items: flex-end; gap: 4px; flex-shrink: 0;
  }
  .vis-time {
    font-family: var(--font-mono, monospace); font-size: 0.66rem;
    color: rgba(255,255,255,0.27); text-align: right;
  }
  .vis-new-badge {
    font-family: var(--font-mono, monospace); font-size: 0.58rem;
    background: var(--accent, #e8c547); color: #000;
    padding: 0.15rem 0.4rem; border-radius: 2px; letter-spacing: 0.04em;
  }
  .vis-visits {
    font-family: var(--font-mono, monospace); font-size: 0.64rem;
    color: rgba(255,255,255,0.28);
  }
  .vis-empty {
    text-align: center; padding: 3rem 1rem;
    color: rgba(255,255,255,0.22);
    font-family: var(--font-mono, monospace); font-size: 0.82rem;
  }
  .vis-empty-icon { font-size: 2rem; margin-bottom: 0.75rem; display: block; }
  .vis-setup-warn {
    margin: 1rem 1.5rem; padding: 0.9rem 1rem;
    background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.25);
    border-radius: 4px; font-family: var(--font-mono, monospace);
    font-size: 0.76rem; color: #e74c3c; line-height: 1.8;
  }
  .vis-setup-warn a { color: var(--accent, #e8c547); }
  .vis-setup-warn code {
    background: rgba(255,255,255,0.06); padding: 0.1rem 0.35rem; border-radius: 2px;
  }
  `;
  document.head.appendChild(s);
}

/* ── SIGN-IN GATE ─────────────────────────────────────────────*/
function buildGate() {
  if (document.getElementById('hrs-signin-gate')) return;
  var gate = document.createElement('div');
  gate.id = 'hrs-signin-gate';
  gate.innerHTML = `
    <div class="hrs-gate-card">
      <div class="hrs-gate-logo">
        <img id="hrs-gate-logo-img" src="Test.png" alt="" onerror="this.style.display='none'">
      </div>
      <div class="hrs-gate-eyebrow">Hariharan R · Portfolio</div>
      <div class="hrs-gate-title">Welcome.</div>
      <div class="hrs-gate-sub">Sign in with your Google account to<br><strong>explore the full portfolio.</strong></div>
      <div class="hrs-gate-divider"><span></span><em>CONTINUE WITH</em><span></span></div>
      <div id="hrs-gate-google-btn"></div>
      <div id="hrs-gate-success">
        <img class="hrs-gate-s-avatar" id="hrs-gate-avatar" src="" alt="">
        <div class="hrs-gate-s-name" id="hrs-gate-welcome"></div>
        <div class="hrs-gate-s-msg">✅ Visit recorded — Welcome!</div>
        <button class="hrs-gate-enter-btn" onclick="hrsEnterPortfolio()">ENTER PORTFOLIO →</button>
      </div>
      <div class="hrs-gate-privacy">🔒 Stored only in this browser. No data sent to any server.</div>
    </div>`;
  document.body.appendChild(gate);
}

function showGate() {
  var gate = document.getElementById('hrs-signin-gate');
  if (!gate) return;
  document.body.style.overflow = 'hidden';

  /* ── Relay mousemove so the custom cursor works over the gate overlay ── */
  gate.addEventListener('mousemove', function(e) {
    var dot  = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (dot)  { dot.style.left  = e.clientX + 'px'; dot.style.top  = e.clientY + 'px'; }
    if (ring) { ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px'; }
  });

  requestAnimationFrame(function() { gate.classList.add('visible'); });
}

window.hrsEnterPortfolio = function() {
  var gate = document.getElementById('hrs-signin-gate');
  if (!gate) return;
  gate.classList.add('hiding');
  document.body.style.overflow = '';
  setTimeout(function() { gate.remove(); }, 600);
};

/* ── HEADER PROFILE CHIP ──────────────────────────────────────*/
function buildProfileChip(profile) {
  // Remove any existing chip
  var old = document.getElementById('hrs-profile-chip');
  if (old) old.remove();

  var chip = document.createElement('div');
  chip.id = 'hrs-profile-chip';
  chip.setAttribute('aria-label', 'Your account');

  var avatarHTML = profile.picture
    ? '<img class="hrs-chip-avatar" src="' + profile.picture + '" alt="' + profile.name + '" onerror="this.style.display=\'none\'">'
    : '<div class="hrs-chip-avatar" style="background:rgba(232,197,71,0.15);display:flex;align-items:center;justify-content:center;font-size:1rem;">👤</div>';

  chip.innerHTML = avatarHTML +
    `<svg class="hrs-chip-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6,9 12,15 18,9"/></svg>
    <div class="hrs-chip-dropdown">
      <div class="hrs-dd-header">
        ${profile.picture
          ? '<img class="hrs-dd-avatar" src="' + profile.picture + '" alt="" onerror="this.style.display=\'none\'">'
          : '<div class="hrs-dd-avatar-placeholder">👤</div>'}
        <div class="hrs-dd-info">
          <div class="hrs-dd-name">${profile.name}</div>
          <div class="hrs-dd-email">${profile.email}</div>
          <div class="hrs-dd-badge">● Signed in</div>
        </div>
      </div>
      <div class="hrs-dd-body">
        <div class="hrs-dd-item" onclick="document.querySelector('#contact').scrollIntoView({behavior:'smooth'});hrsCloseChip()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          Hire Hariharan
        </div>
        <div class="hrs-dd-item" onclick="window.scrollTo({top:0,behavior:'smooth'});hrsCloseChip()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,8 12,12 14,14"/></svg>
          Back to Top
        </div>
        <div class="hrs-dd-sep"></div>
        <div class="hrs-dd-signout" onclick="hrsSignOut()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </div>
      </div>
      <div class="hrs-dd-footer">🔒 Data stored only in your browser</div>
    </div>`;

  // Toggle dropdown on click
  chip.addEventListener('click', function(e) {
    e.stopPropagation();
    chip.classList.toggle('open');
  });

  // Insert into #header-right (before freelance-bar)
  var headerRight = document.getElementById('header-right');
  var freelanceBar = document.getElementById('freelance-bar');
  if (headerRight && freelanceBar) {
    headerRight.insertBefore(chip, freelanceBar);
  } else if (headerRight) {
    headerRight.appendChild(chip);
  } else {
    // Fallback — fixed position top-right
    chip.style.cssText = 'position:fixed;top:18px;right:20px;z-index:99998;';
    document.body.appendChild(chip);
  }

  // Show with small delay for animation
  setTimeout(function() { chip.classList.add('ready'); }, 100);

  // Close on outside click
  document.addEventListener('click', function() {
    chip.classList.remove('open');
  });
}

window.hrsCloseChip = function() {
  var chip = document.getElementById('hrs-profile-chip');
  if (chip) chip.classList.remove('open');
};

window.hrsSignOut = function() {
  if (!confirm('Sign out? You\'ll need to sign in again to view the portfolio.')) return;
  clearSignedInUser();
  // Revoke Google session silently
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try { google.accounts.id.disableAutoSelect(); } catch(e) {}
  }
  // Reload page — gate will reappear
  window.location.reload();
};

/* ── GOOGLE SIGN-IN ───────────────────────────────────────────*/
function renderGateGoogleBtn() {
  var wrap = document.getElementById('hrs-gate-google-btn');
  if (!wrap || !window.google) return;
  wrap.innerHTML = '';
  google.accounts.id.renderButton(wrap, {
    type: 'standard', theme: 'filled_black', size: 'large',
    text: 'signin_with', shape: 'rectangular',
    logo_alignment: 'left', width: 280
  });
}

function handleGoogleCredential(response) {
  try {
    var payload = JSON.parse(
      atob(response.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))
    );
    var profile = { name: payload.name, email: payload.email, picture: payload.picture };
    setSignedInUser(profile);
    recordVisitor(profile);
    buildProfileChip(profile);
    showGateSuccess(profile);
    if (document.getElementById('tab-visitors') &&
        document.getElementById('tab-visitors').classList.contains('active')) {
      renderVisitorsTab();
    }
  } catch(err) {
    console.error('[Visitor Gate]', err);
  }
}

function showGateSuccess(profile) {
  var googleBtnEl = document.getElementById('hrs-gate-google-btn');
  var divider     = document.querySelector('.hrs-gate-divider');
  var sub         = document.querySelector('.hrs-gate-sub');
  if (googleBtnEl) googleBtnEl.style.display = 'none';
  if (divider)     divider.style.display = 'none';
  if (sub)         sub.style.display = 'none';
  var success = document.getElementById('hrs-gate-success');
  var avatar  = document.getElementById('hrs-gate-avatar');
  var welcome = document.getElementById('hrs-gate-welcome');
  if (avatar)  { avatar.src = profile.picture || ''; if (!profile.picture) avatar.style.display='none'; }
  if (welcome) welcome.textContent = 'Hi, ' + profile.name.split(' ')[0] + '! 👋';
  if (success) success.classList.add('show');
  setTimeout(hrsEnterPortfolio, 2500);
}

function initGoogleSignIn() {
  if (!window.google || !window.google.accounts) return;
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) {
    var wrap = document.getElementById('hrs-gate-google-btn');
    if (wrap) wrap.innerHTML = '<div style="font-family:monospace;font-size:0.72rem;color:#e74c3c;padding:0.8rem;background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.25);border-radius:4px;line-height:1.8;">⚠️ Set GOOGLE_CLIENT_ID<br>in visitor-tracker.js</div>';
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: false
  });
  renderGateGoogleBtn();
}

/* ── ADMIN VISITORS TAB ───────────────────────────────────────*/
function injectVisitorsTab() {
  var tabBar = document.querySelector('.admin-tabs');
  if (tabBar && !document.querySelector('[data-hrs-visitors]')) {
    var btn = document.createElement('button');
    btn.className = 'admin-tab';
    btn.setAttribute('data-hrs-visitors', '1');
    btn.textContent = '👥 Visitors';
    // ✅ CORRECT — hooks into the page's switchTab system
btn.onclick = function() {
  if (window.switchTab) {
    window.switchTab('visitors');
  } else {
    document.querySelectorAll('.admin-tab').forEach(function(t){ t.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(function(s){ s.classList.remove('active'); });
    var sec = document.getElementById('tab-visitors');
    if (sec) { sec.classList.add('active'); }
  }
  renderVisitorsTab();
};
    tabBar.appendChild(btn);
  }
  if (!document.getElementById('tab-visitors')) {
    var section = document.createElement('div');
    section.id = 'tab-visitors';
    section.className = 'admin-section';
    section.innerHTML = '<div id="visitors-content"></div>';
    var panel = document.getElementById('admin-panel');
    var footer = panel && (panel.querySelector('.admin-actions') || panel.querySelector('.admin-footer'));
    if (footer) panel.insertBefore(section, footer);
    else if (panel) panel.appendChild(section);
  }
}

function buildVisitorListHTML(visitors) {
  var nowTs = Date.now();
  if (visitors.length === 0)
    return '<div class="vis-empty"><span class="vis-empty-icon">\uD83D\uDD0D</span>No visitors yet.<br>They\'ll appear here after signing in.</div>';
  return visitors.map(function(v) {
    var date = new Date(v.time);
    var isNew = (nowTs - date.getTime()) < 3600000;
    var avHTML = v.picture
      ? '<img class="vis-avatar" src="' + v.picture + '" alt="" onerror="this.style.display=\'none\'">'
      : '<div class="vis-avatar-ph">\uD83D\uDC64</div>';
    var lastSeen = v.lastSeen ? getTimeAgo(new Date(v.lastSeen)) : '';
    return '<div class="vis-card">' +
      avHTML +
      '<div class="vis-info">' +
        '<div class="vis-name">' + v.name + '</div>' +
        '<div class="vis-email">\u2709\uFE0F ' + v.email + '</div>' +
        '<div class="vis-meta">' +
          '<span>' + (v.device||'') + '</span><span>\uD83C\uDF10 ' + (v.browser||'') + '</span>' +
          '<span>\uD83D\uDD17 ' + trimRef(v.ref) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="vis-right">' +
        (isNew ? '<span class="vis-new-badge">NEW</span>' : '') +
        '<div class="vis-time">' + getTimeAgo(date) + '<br><span style="font-size:0.6rem;opacity:0.6;">' + date.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) + '</span></div>' +
        (v.visits > 1 ? '<div class="vis-visits">\uD83D\uDD01 ' + v.visits + ' visits</div>' : '') +
        (lastSeen ? '<div class="vis-visits">Last: ' + lastSeen + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function renderVisitorsTab() {
  var container = document.getElementById('visitors-content');
  if (!container) return;
  var clientIdSet = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE');
  var firebaseSet = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';
  var warnHTML = '';
  if (!clientIdSet) warnHTML += '<div class="vis-setup-warn">\u26A0\uFE0F <strong>Setup needed:</strong> Set your <code>GOOGLE_CLIENT_ID</code> in visitor-tracker.js.<br><a href="https://console.cloud.google.com/" target="_blank">\u2192 Get a free Google Client ID</a></div>';
  if (!firebaseSet) warnHTML += '<div class="vis-setup-warn" style="margin-top:0.5rem;">\u26A0\uFE0F <strong>Firebase not configured:</strong> Fill in <code>FIREBASE_CONFIG</code> in visitor-tracker.js.<br><a href="https://console.firebase.google.com/" target="_blank">\u2192 Create a free Firebase project</a></div>';

  container.innerHTML = warnHTML + '<div class="vis-list"><div class="vis-empty"><span class="vis-empty-icon">\u23F3</span>Loading visitors…</div></div>';

  getVisitors(function(visitors) {
    var listHTML = buildVisitorListHTML(visitors);
    container.innerHTML = warnHTML +
      '<div class="vis-header">' +
        '<h3>\uD83D\uDC65 VISITOR LOG</h3>' +
        '<div style="display:flex;align-items:center;gap:0.75rem;">' +
          '<span class="vis-count-badge">' + visitors.length + ' visitor' + (visitors.length !== 1 ? 's' : '') + '</span>' +
          (visitors.length > 0 ? '<button class="vis-clear-btn" onclick="hrsClearVisitors()">\uD83D\uDDD1\uFE0F Clear All</button>' : '') +
        '</div>' +
      '</div>' +
      '<div class="vis-note">\uD83D\uDD12 Visitor data saved to Firebase Firestore — visible from any device in admin panel.</div>' +
      '<div class="vis-list">' + listHTML + '</div>';
  });
}

window.hrsClearVisitors = function() {
  if (!confirm('Clear ALL visitor records from Firestore? This cannot be undone.')) return;
  loadFirebase(function(db) {
    db.collection(FIRESTORE_COLLECTION).get().then(function(snapshot) {
      var batch = db.batch();
      snapshot.forEach(function(doc) { batch.delete(doc.ref); });
      return batch.commit();
    }).then(function() {
      saveVisitorsLocal([]);
      renderVisitorsTab();
    }).catch(function(err) {
      console.error('[Visitor Tracker] Clear failed:', err);
    });
  });
};
/* ── HELPERS ──────────────────────────────────────────────────*/
function getTimeAgo(date) {
  var diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}
function trimRef(ref) {
  if (!ref || ref==='Direct') return 'Direct';
  try { return new URL(ref).hostname.replace('www.',''); }
  catch(e) { return ref.slice(0,25); }
}

/* ── PATCH openAdmin ──────────────────────────────────────────*/
// ✅ CORRECT — waits until everything is loaded
window.addEventListener('load', function() {
  var _orig = window.openAdmin;
  window.openAdmin = function() {
    if (_orig) _orig.apply(this, arguments);
    setTimeout(function() {
      injectVisitorsTab();
      var sec = document.getElementById('tab-visitors');
      if (sec && sec.classList.contains('active')) renderVisitorsTab();
    }, 60);
  };
});

/* ── INTRO DETECTION ──────────────────────────────────────────*/
window.hrsIntroFinished = function() {
  showGate();
  if (window.google && window.google.accounts) renderGateGoogleBtn();
};

function watchForIntroEnd() {
  var introSelectors = ['#intro','#intro-screen','#loader','#preloader','.intro-screen','.loader'];
  var introEl = null;
  for (var i=0;i<introSelectors.length;i++) { introEl=document.querySelector(introSelectors[i]); if(introEl) break; }
  if (introEl) {
    var observer = new MutationObserver(function() {
      var el = document.querySelector(introSelectors.join(','));
      if (!el || el.style.display==='none' || el.style.opacity==='0' ||
          el.classList.contains('hidden') || el.classList.contains('done')) {
        observer.disconnect();
        setTimeout(window.hrsIntroFinished, 300);
      }
    });
    observer.observe(document.body, {attributes:true, childList:true, subtree:true});
    setTimeout(function() {
      observer.disconnect();
      var gate = document.getElementById('hrs-signin-gate');
      if (gate && !gate.classList.contains('visible')) window.hrsIntroFinished();
    }, 8000);
  } else {
    setTimeout(window.hrsIntroFinished, 800);
  }
}

/* ── INIT ─────────────────────────────────────────────────────*/
function init() {
  injectStyles();
  var existingUser = getSignedInUser();
  if (existingUser) {
    // Returning visitor — skip gate, show chip, record visit
    recordVisitor(existingUser);
    buildProfileChip(existingUser);
    return;
  }
  // New visitor
  buildGate();
  var gsi = document.createElement('script');
  gsi.src = 'https://accounts.google.com/gsi/client';
  gsi.async = true; gsi.defer = true;
  gsi.onload = initGoogleSignIn;
  document.head.appendChild(gsi);
  watchForIntroEnd();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
