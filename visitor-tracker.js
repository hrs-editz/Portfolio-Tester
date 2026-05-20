/* ================================================================
   HARIHARAN R — PORTFOLIO  |  visitor-tracker.js
   Google Sign-In Visitor Tracking + Admin Panel "Visitors" Tab
   ─────────────────────────────────────────────────────────────
   HOW IT WORKS:
   1. Visitor sees a subtle "Sign in with Google" toast/prompt
   2. If they sign in → their name, email, photo, time, device
      are saved to localStorage
   3. In Admin Panel → "Visitors" tab shows all visitor details
   4. You can clear the list any time from admin
================================================================ */

/* ── CONFIG ─────────────────────────────────────────────────── */
// Replace with your own Google OAuth Client ID
// Get one free at: https://console.cloud.google.com/
// Authorised JS origins: add your GitHub Pages URL + http://localhost
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

const VISITOR_STORAGE_KEY = 'hrs_visitors';
const SIGNIN_PROMPTED_KEY = 'hrs_signin_prompted';

/* ── VISITOR DATA HELPERS ─────────────────────────────────────*/
function getVisitors() {
  try {
    return JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || '[]');
  } catch(e) { return []; }
}

function saveVisitors(arr) {
  try { localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(arr)); } catch(e) {}
}

function recordVisitor(profile) {
  var visitors = getVisitors();
  // Avoid duplicate entries for same email in same browser session
  var sessionKey = 'hrs_session_' + profile.email;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  var ua = navigator.userAgent;
  var device = /Mobi|Android/i.test(ua) ? '📱 Mobile' :
               /Tablet|iPad/i.test(ua)   ? '📲 Tablet' : '🖥️ Desktop';
  var browser = /Chrome/i.test(ua) && !/Edg/i.test(ua) ? 'Chrome' :
                /Firefox/i.test(ua) ? 'Firefox' :
                /Safari/i.test(ua)  ? 'Safari'  :
                /Edg/i.test(ua)     ? 'Edge'    : 'Other';

  visitors.unshift({
    name:    profile.name    || 'Unknown',
    email:   profile.email   || '—',
    picture: profile.picture || '',
    time:    new Date().toISOString(),
    device:  device,
    browser: browser,
    ref:     document.referrer || 'Direct'
  });

  // Keep max 200 entries
  if (visitors.length > 200) visitors = visitors.slice(0, 200);
  saveVisitors(visitors);
}

/* ── GOOGLE SIGN-IN TOAST ─────────────────────────────────────*/
function injectGoogleStyles() {
  if (document.getElementById('hrs-visitor-styles')) return;
  var style = document.createElement('style');
  style.id = 'hrs-visitor-styles';
  style.textContent = `
    #hrs-signin-toast {
      position: fixed;
      bottom: 90px;
      right: 28px;
      z-index: 99998;
      background: #1a1a1a;
      border: 1px solid rgba(232,197,71,0.25);
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.55);
      max-width: 310px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s ease, transform 0.4s ease;
      pointer-events: none;
    }
    #hrs-signin-toast.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    #hrs-signin-toast .toast-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    #hrs-signin-toast .toast-text {
      font-family: var(--font-body, sans-serif);
      font-size: 0.8rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.4;
      flex: 1;
    }
    #hrs-signin-toast .toast-text strong {
      color: #fff;
      display: block;
      margin-bottom: 2px;
      font-size: 0.85rem;
    }
    #hrs-signin-toast .toast-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.35);
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    #hrs-signin-toast .toast-close:hover { color: rgba(255,255,255,0.7); }

    /* Google Sign-In button container inside toast */
    #hrs-google-btn-wrap {
      margin-top: 10px;
    }

    /* Admin visitors tab styles */
    #tab-visitors {
      padding: 0;
    }
    .vis-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .vis-header h3 {
      font-family: var(--font-mono, monospace);
      font-size: 0.85rem;
      color: var(--accent, #e8c547);
      letter-spacing: 0.08em;
      margin: 0;
    }
    .vis-count-badge {
      background: rgba(232,197,71,0.12);
      border: 1px solid rgba(232,197,71,0.25);
      color: var(--accent, #e8c547);
      font-family: var(--font-mono, monospace);
      font-size: 0.72rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
    }
    .vis-clear-btn {
      background: rgba(231,76,60,0.1);
      border: 1px solid rgba(231,76,60,0.3);
      color: #e74c3c;
      font-family: var(--font-mono, monospace);
      font-size: 0.72rem;
      padding: 0.35rem 0.85rem;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .vis-clear-btn:hover {
      background: rgba(231,76,60,0.2);
      border-color: rgba(231,76,60,0.5);
    }
    .vis-note {
      padding: 0.75rem 1.5rem;
      background: rgba(232,197,71,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-family: var(--font-mono, monospace);
      font-size: 0.72rem;
      color: rgba(255,255,255,0.35);
      line-height: 1.6;
    }
    .vis-list {
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 60vh;
      overflow-y: auto;
    }
    .vis-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 6px;
      padding: 0.9rem 1rem;
      transition: border-color 0.2s;
    }
    .vis-card:hover { border-color: rgba(232,197,71,0.2); }
    .vis-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(232,197,71,0.3);
      flex-shrink: 0;
    }
    .vis-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(232,197,71,0.1);
      border: 2px solid rgba(232,197,71,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .vis-info { flex: 1; min-width: 0; }
    .vis-name {
      font-family: var(--font-body, sans-serif);
      font-size: 0.88rem;
      color: #fff;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .vis-email {
      font-family: var(--font-mono, monospace);
      font-size: 0.73rem;
      color: var(--accent, #e8c547);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .vis-meta {
      font-family: var(--font-mono, monospace);
      font-size: 0.68rem;
      color: rgba(255,255,255,0.35);
      margin-top: 4px;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .vis-meta span {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .vis-time {
      font-family: var(--font-mono, monospace);
      font-size: 0.68rem;
      color: rgba(255,255,255,0.3);
      text-align: right;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .vis-empty {
      text-align: center;
      padding: 3rem 1rem;
      color: rgba(255,255,255,0.25);
      font-family: var(--font-mono, monospace);
      font-size: 0.82rem;
    }
    .vis-empty .vis-empty-icon { font-size: 2rem; margin-bottom: 0.75rem; display: block; }
    .vis-new-badge {
      font-family: var(--font-mono, monospace);
      font-size: 0.6rem;
      background: var(--accent, #e8c547);
      color: #000;
      padding: 0.15rem 0.4rem;
      border-radius: 2px;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

function buildSignInToast() {
  if (document.getElementById('hrs-signin-toast')) return;
  var toast = document.createElement('div');
  toast.id = 'hrs-signin-toast';
  toast.innerHTML = `
    <div class="toast-icon">👀</div>
    <div class="toast-text">
      <strong>You're on Hariharan's Portfolio</strong>
      Sign in with Google so he knows you visited!
      <div id="hrs-google-btn-wrap"></div>
    </div>
    <button class="toast-close" onclick="hrsCloseToast()" title="Dismiss">✕</button>
  `;
  document.body.appendChild(toast);

  // Show after 3 seconds if not already prompted this session
  if (!sessionStorage.getItem(SIGNIN_PROMPTED_KEY)) {
    setTimeout(function() {
      toast.classList.add('show');
      sessionStorage.setItem(SIGNIN_PROMPTED_KEY, '1');
      // Render Google button inside toast
      if (window.google && window.google.accounts) {
        renderGoogleBtn('hrs-google-btn-wrap', true);
      }
    }, 3000);
  }
}

window.hrsCloseToast = function() {
  var t = document.getElementById('hrs-signin-toast');
  if (t) { t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 400); }
};

/* ── GOOGLE IDENTITY SERVICES ─────────────────────────────────*/
function renderGoogleBtn(containerId, compact) {
  var container = document.getElementById(containerId);
  if (!container || !window.google) return;
  container.innerHTML = '';
  google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'filled_black',
    size: compact ? 'medium' : 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: compact ? 240 : 280
  });
}

function initGoogleSignIn() {
  if (!window.google || !window.google.accounts) return;
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) {
    console.warn('[Visitor Tracker] Set your GOOGLE_CLIENT_ID in visitor-tracker.js');
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  // Render btn in toast if visible
  renderGoogleBtn('hrs-google-btn-wrap', true);
}

function handleGoogleCredential(response) {
  try {
    // Decode JWT payload (no library needed — it's just base64)
    var payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    var profile = {
      name:    payload.name,
      email:   payload.email,
      picture: payload.picture
    };
    recordVisitor(profile);
    hrsCloseToast();
    showSignInSuccess(profile);
    // Refresh admin visitors tab if open
    if (document.getElementById('admin-panel') &&
        document.getElementById('admin-panel').classList.contains('open')) {
      renderVisitorsTab();
    }
  } catch(err) {
    console.error('[Visitor Tracker] Failed to decode credential:', err);
  }
}

function showSignInSuccess(profile) {
  var toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:90px;right:28px;z-index:99999;
    background:#1a1a1a;border:1px solid rgba(46,204,113,0.3);
    border-radius:8px;padding:12px 16px;
    display:flex;align-items:center;gap:10px;
    box-shadow:0 8px 32px rgba(0,0,0,0.55);
    font-family:var(--font-body,sans-serif);font-size:0.82rem;color:#fff;
    opacity:0;transform:translateY(16px);
    transition:opacity 0.3s,transform 0.3s;
    max-width:280px;
  `;
  toast.innerHTML = (profile.picture
    ? '<img src="' + profile.picture + '" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">'
    : '<span style="font-size:1.2rem">✅</span>') +
    '<div><div style="font-weight:600;margin-bottom:2px;">Thanks, ' + (profile.name.split(' ')[0]) + '!</div>' +
    '<div style="color:rgba(255,255,255,0.5);font-size:0.75rem;">Your visit has been recorded 🎉</div></div>';
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity='1'; toast.style.transform='translateY(0)'; }, 50);
  setTimeout(function() {
    toast.style.opacity='0'; toast.style.transform='translateY(16px)';
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
}

/* ── ADMIN PANEL — VISITORS TAB ───────────────────────────────*/
function injectVisitorsTab() {
  // 1. Add tab button
  var tabBar = document.querySelector('.admin-tabs');
  if (tabBar && !document.querySelector('[data-tab="visitors"]')) {
    var btn = document.createElement('button');
    btn.className = 'admin-tab';
    btn.setAttribute('data-tab', 'visitors');
    btn.textContent = '👥 Visitors';
    btn.onclick = function(e) {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
      var sec = document.getElementById('tab-visitors');
      if (sec) sec.classList.add('active');
    };
    tabBar.appendChild(btn);
  }

  // 2. Add tab content section
  var panel = document.getElementById('admin-panel');
  if (panel && !document.getElementById('tab-visitors')) {
    var section = document.createElement('div');
    section.id = 'tab-visitors';
    section.className = 'admin-section';
    section.innerHTML = '<div id="visitors-content"></div>';
    // Insert before the panel footer / save bar
    var footer = panel.querySelector('.admin-footer') || panel.querySelector('.admin-actions');
    if (footer) {
      panel.insertBefore(section, footer);
    } else {
      panel.appendChild(section);
    }
  }
}

function renderVisitorsTab() {
  var container = document.getElementById('visitors-content');
  if (!container) return;

  var visitors = getVisitors();
  var nowTs = Date.now();

  var listHTML = '';
  if (visitors.length === 0) {
    listHTML = `
      <div class="vis-empty">
        <span class="vis-empty-icon">🔍</span>
        No signed-in visitors yet.<br>
        Visitors who click "Sign in with Google" will appear here.
      </div>`;
  } else {
    listHTML = visitors.map(function(v, i) {
      var date = new Date(v.time);
      var timeAgo = getTimeAgo(date);
      var isNew = (nowTs - date.getTime()) < 3600000; // within 1 hour
      var avatarHTML = v.picture
        ? '<img class="vis-avatar" src="' + v.picture + '" alt="' + v.name + '" onerror="this.style.display=\'none\'">'
        : '<div class="vis-avatar-placeholder">👤</div>';
      return `
        <div class="vis-card">
          ${avatarHTML}
          <div class="vis-info">
            <div class="vis-name">${v.name}</div>
            <div class="vis-email">✉️ ${v.email}</div>
            <div class="vis-meta">
              <span>${v.device}</span>
              <span>🌐 ${v.browser}</span>
              ${v.ref && v.ref !== 'Direct' ? '<span>🔗 ' + trimRef(v.ref) + '</span>' : '<span>🔗 Direct</span>'}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
            ${isNew ? '<span class="vis-new-badge">NEW</span>' : ''}
            <div class="vis-time">${timeAgo}<br><span style="font-size:0.62rem;opacity:0.6;">${date.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span></div>
          </div>
        </div>`;
    }).join('');
  }

  var clientIdSet = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE');
  var setupWarning = clientIdSet ? '' : `
    <div style="margin:1rem 1.5rem;padding:0.9rem 1rem;background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.25);border-radius:4px;font-family:var(--font-mono,monospace);font-size:0.76rem;color:#e74c3c;line-height:1.7;">
      ⚠️ <strong>Setup needed:</strong> Open <code>visitor-tracker.js</code> and replace<br>
      <code>YOUR_GOOGLE_CLIENT_ID_HERE</code> with your real Client ID.<br>
      <a href="https://console.cloud.google.com/" target="_blank" style="color:var(--accent,#e8c547);">→ Get a free Google Client ID</a>
    </div>`;

  container.innerHTML = `
    ${setupWarning}
    <div class="vis-header">
      <h3>👥 VISITOR LOG</h3>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span class="vis-count-badge">${visitors.length} visitor${visitors.length !== 1 ? 's' : ''}</span>
        ${visitors.length > 0 ? '<button class="vis-clear-btn" onclick="hrsClearVisitors()">🗑️ Clear All</button>' : ''}
      </div>
    </div>
    <div class="vis-note">
      Only visitors who voluntarily clicked "Sign in with Google" are shown here.
      Their name, Gmail, device, and visit time are stored only in your browser's localStorage.
    </div>
    <div class="vis-list">
      ${listHTML}
    </div>`;
}

window.hrsClearVisitors = function() {
  if (!confirm('Clear all visitor records? This cannot be undone.')) return;
  saveVisitors([]);
  renderVisitorsTab();
};

/* ── TIME HELPERS ─────────────────────────────────────────────*/
function getTimeAgo(date) {
  var diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

function trimRef(ref) {
  try {
    var url = new URL(ref);
    return url.hostname.replace('www.','');
  } catch(e) { return ref.slice(0, 30); }
}

/* ── HOOK INTO ADMIN PANEL OPEN ───────────────────────────────*/
// Patch the existing openAdmin function to also render visitors tab
(function() {
  var _origOpenAdmin = window.openAdmin;
  window.openAdmin = function() {
    if (_origOpenAdmin) _origOpenAdmin();
    // Give the panel a tick to render, then inject visitors tab
    setTimeout(function() {
      injectVisitorsTab();
      renderVisitorsTab();
    }, 50);
  };
})();

/* ── INIT ─────────────────────────────────────────────────────*/
function initVisitorTracker() {
  injectGoogleStyles();
  buildSignInToast();

  // Load Google Identity Services script
  var gsiScript = document.createElement('script');
  gsiScript.src = 'https://accounts.google.com/gsi/client';
  gsiScript.async = true;
  gsiScript.defer = true;
  gsiScript.onload = function() {
    initGoogleSignIn();
    // If toast is already showing, render the button inside it
    var wrap = document.getElementById('hrs-google-btn-wrap');
    if (wrap) renderGoogleBtn('hrs-google-btn-wrap', true);
  };
  document.head.appendChild(gsiScript);
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorTracker);
} else {
  initVisitorTracker();
}
