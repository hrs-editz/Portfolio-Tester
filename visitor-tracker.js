/* ================================================================
   HARIHARAN R — PORTFOLIO  |  visitor-tracker.js
   Mandatory Google Sign-In Gate + Admin Visitors Tab
   ─────────────────────────────────────────────────────────────
   FLOW:
   1. Intro animation plays normally
   2. After intro ends → full-screen sign-in gate appears
   3. Visitor MUST sign in with Google to access the portfolio
   4. Once signed in → gate fades out, portfolio is visible
   5. Returning visitors (same browser) skip the gate
   6. Admin Panel → "👥 Visitors" tab shows all visitor details
================================================================ */

/* ── CONFIG ──────────────────────────────────────────────────── */
// Replace with your Google OAuth Client ID from console.cloud.google.com
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

const VISITOR_STORAGE_KEY  = 'hrs_visitors';
const SIGNED_IN_KEY        = 'hrs_signed_in_user'; // persists across sessions

/* ── VISITOR DATA HELPERS ──────────────────────────────────────*/
function getVisitors() {
  try { return JSON.parse(localStorage.getItem(VISITOR_STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveVisitors(arr) {
  try { localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(arr)); } catch(e) {}
}
function getSignedInUser() {
  try { return JSON.parse(localStorage.getItem(SIGNED_IN_KEY) || 'null'); }
  catch(e) { return null; }
}
function setSignedInUser(profile) {
  try { localStorage.setItem(SIGNED_IN_KEY, JSON.stringify(profile)); } catch(e) {}
}

function recordVisitor(profile) {
  var visitors = getVisitors();
  // Only record once per email (first-ever visit)
  var alreadyRecorded = visitors.some(function(v) { return v.email === profile.email; });

  var ua = navigator.userAgent;
  var device  = /Mobi|Android/i.test(ua) ? '📱 Mobile' :
                /Tablet|iPad/i.test(ua)   ? '📲 Tablet' : '🖥️ Desktop';
  var browser = /Edg/i.test(ua)     ? 'Edge'    :
                /Chrome/i.test(ua)  ? 'Chrome'  :
                /Firefox/i.test(ua) ? 'Firefox' :
                /Safari/i.test(ua)  ? 'Safari'  : 'Other';

  if (!alreadyRecorded) {
    visitors.unshift({
      name:    profile.name    || 'Unknown',
      email:   profile.email   || '—',
      picture: profile.picture || '',
      time:    new Date().toISOString(),
      device:  device,
      browser: browser,
      ref:     document.referrer || 'Direct',
      visits:  1
    });
    if (visitors.length > 500) visitors = visitors.slice(0, 500);
  } else {
    // Increment visit count for returning visitors
    visitors = visitors.map(function(v) {
      if (v.email === profile.email) {
        v.visits = (v.visits || 1) + 1;
        v.lastSeen = new Date().toISOString();
      }
      return v;
    });
  }
  saveVisitors(visitors);
}

/* ── STYLES ────────────────────────────────────────────────────*/
function injectStyles() {
  if (document.getElementById('hrs-gate-styles')) return;
  var s = document.createElement('style');
  s.id = 'hrs-gate-styles';
  s.textContent = `
    /* ── SIGN-IN GATE ── */
    #hrs-signin-gate {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #0a0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0;
      opacity: 0;
      transition: opacity 0.5s ease;
      overflow: hidden;
    }
    #hrs-signin-gate.visible { opacity: 1; }
    #hrs-signin-gate.hiding {
      opacity: 0;
      pointer-events: none;
    }

    /* Background subtle grid */
    #hrs-signin-gate::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(232,197,71,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,197,71,0.04) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
    }

    .hrs-gate-card {
      position: relative;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(232,197,71,0.18);
      border-radius: 12px;
      padding: 2.8rem 2.5rem 2.5rem;
      max-width: 420px;
      width: calc(100% - 3rem);
      text-align: center;
      backdrop-filter: blur(12px);
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,197,71,0.08);
    }

    .hrs-gate-logo {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(232,197,71,0.1);
      border: 2px solid rgba(232,197,71,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.4rem;
      font-size: 1.8rem;
    }

    .hrs-gate-name {
      font-family: var(--font-mono, monospace);
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      color: var(--accent, #e8c547);
      text-transform: uppercase;
      margin-bottom: 0.6rem;
    }

    .hrs-gate-title {
      font-family: var(--font-heading, serif);
      font-size: 1.55rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.6rem;
      line-height: 1.2;
    }

    .hrs-gate-sub {
      font-family: var(--font-body, sans-serif);
      font-size: 0.84rem;
      color: rgba(255,255,255,0.45);
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .hrs-gate-sub strong {
      color: rgba(255,255,255,0.7);
    }

    .hrs-gate-divider {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1.4rem;
    }
    .hrs-gate-divider span {
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.08);
    }
    .hrs-gate-divider em {
      font-style: normal;
      font-family: var(--font-mono, monospace);
      font-size: 0.65rem;
      color: rgba(255,255,255,0.25);
      letter-spacing: 0.06em;
    }

    #hrs-gate-google-btn {
      display: flex;
      justify-content: center;
      margin-bottom: 1.2rem;
    }

    .hrs-gate-privacy {
      font-family: var(--font-mono, monospace);
      font-size: 0.63rem;
      color: rgba(255,255,255,0.2);
      line-height: 1.7;
    }
    .hrs-gate-privacy a {
      color: rgba(232,197,71,0.5);
      text-decoration: none;
    }

    /* Success state */
    #hrs-gate-success {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
    }
    #hrs-gate-success.show { display: flex; }
    .hrs-gate-success-avatar {
      width: 56px; height: 56px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(232,197,71,0.5);
    }
    .hrs-gate-success-name {
      font-family: var(--font-body, sans-serif);
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
    }
    .hrs-gate-success-msg {
      font-family: var(--font-mono, monospace);
      font-size: 0.75rem;
      color: var(--accent, #e8c547);
      letter-spacing: 0.06em;
    }
    .hrs-gate-enter-btn {
      margin-top: 0.5rem;
      background: var(--accent, #e8c547);
      color: #000;
      border: none;
      padding: 0.75rem 2.2rem;
      border-radius: 4px;
      font-family: var(--font-mono, monospace);
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .hrs-gate-enter-btn:hover {
      background: #f5d76e;
      transform: translateY(-1px);
    }

    /* ── ADMIN VISITORS TAB ── */
    .vis-header {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .vis-header h3 {
      font-family: var(--font-mono, monospace);
      font-size: 0.85rem; color: var(--accent, #e8c547);
      letter-spacing: 0.08em; margin: 0;
    }
    .vis-count-badge {
      background: rgba(232,197,71,0.12);
      border: 1px solid rgba(232,197,71,0.25);
      color: var(--accent, #e8c547);
      font-family: var(--font-mono, monospace);
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
      padding: 0.75rem 1.5rem;
      background: rgba(232,197,71,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-family: var(--font-mono, monospace);
      font-size: 0.72rem; color: rgba(255,255,255,0.35); line-height: 1.6;
    }
    .vis-list {
      padding: 1rem 1.5rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      max-height: 60vh; overflow-y: auto;
    }
    .vis-card {
      display: flex; align-items: center; gap: 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 6px; padding: 0.9rem 1rem;
      transition: border-color 0.2s;
    }
    .vis-card:hover { border-color: rgba(232,197,71,0.2); }
    .vis-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      object-fit: cover; border: 2px solid rgba(232,197,71,0.3); flex-shrink: 0;
    }
    .vis-avatar-placeholder {
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
      font-family: var(--font-mono, monospace); font-size: 0.73rem;
      color: var(--accent, #e8c547); margin-top: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .vis-meta {
      font-family: var(--font-mono, monospace); font-size: 0.67rem;
      color: rgba(255,255,255,0.32); margin-top: 4px;
      display: flex; flex-wrap: wrap; gap: 0.5rem;
    }
    .vis-right {
      display: flex; flex-direction: column;
      align-items: flex-end; gap: 5px; flex-shrink: 0;
    }
    .vis-time {
      font-family: var(--font-mono, monospace); font-size: 0.67rem;
      color: rgba(255,255,255,0.28); text-align: right;
    }
    .vis-new-badge {
      font-family: var(--font-mono, monospace); font-size: 0.6rem;
      background: var(--accent, #e8c547); color: #000;
      padding: 0.15rem 0.4rem; border-radius: 2px; letter-spacing: 0.04em;
    }
    .vis-visit-count {
      font-family: var(--font-mono, monospace); font-size: 0.65rem;
      color: rgba(255,255,255,0.3);
    }
    .vis-empty {
      text-align: center; padding: 3rem 1rem;
      color: rgba(255,255,255,0.25);
      font-family: var(--font-mono, monospace); font-size: 0.82rem;
    }
    .vis-empty-icon { font-size: 2rem; margin-bottom: 0.75rem; display: block; }
    .vis-setup-warn {
      margin: 1rem 1.5rem; padding: 0.9rem 1rem;
      background: rgba(231,76,60,0.08); border: 1px solid rgba(231,76,60,0.25);
      border-radius: 4px; font-family: var(--font-mono,monospace);
      font-size: 0.76rem; color: #e74c3c; line-height: 1.8;
    }
    .vis-setup-warn a { color: var(--accent, #e8c547); }
    .vis-setup-warn code {
      background: rgba(255,255,255,0.06); padding: 0.1rem 0.35rem;
      border-radius: 2px; font-size: 0.72rem;
    }
  `;
  document.head.appendChild(s);
}

/* ── BUILD GATE HTML ───────────────────────────────────────────*/
function buildGate() {
  if (document.getElementById('hrs-signin-gate')) return;

  var gate = document.createElement('div');
  gate.id = 'hrs-signin-gate';
  gate.innerHTML = `
    <div class="hrs-gate-card">
      <div class="hrs-gate-logo">🎬</div>
      <div class="hrs-gate-name">Hariharan R · Portfolio</div>
      <div class="hrs-gate-title">Welcome.</div>
      <div class="hrs-gate-sub">
        Sign in with your Google account to<br>
        <strong>explore the full portfolio.</strong>
      </div>

      <div class="hrs-gate-divider">
        <span></span><em>CONTINUE WITH</em><span></span>
      </div>

      <div id="hrs-gate-google-btn"></div>

      <div id="hrs-gate-success">
        <img class="hrs-gate-success-avatar" id="hrs-gate-avatar" src="" alt="">
        <div class="hrs-gate-success-name" id="hrs-gate-welcome"></div>
        <div class="hrs-gate-success-msg">✅ Visit recorded — Welcome!</div>
        <button class="hrs-gate-enter-btn" onclick="hrsEnterPortfolio()">
          ENTER PORTFOLIO →
        </button>
      </div>

      <div class="hrs-gate-privacy">
        🔒 Your sign-in is recorded only in this browser.<br>
        No data is sent to any server.
      </div>
    </div>
  `;
  document.body.appendChild(gate);
}

/* ── SHOW / HIDE GATE ─────────────────────────────────────────*/
function showGate() {
  var gate = document.getElementById('hrs-signin-gate');
  if (!gate) return;
  // Block scroll while gate is open
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function() {
    gate.classList.add('visible');
  });
}

window.hrsEnterPortfolio = function() {
  var gate = document.getElementById('hrs-signin-gate');
  if (!gate) return;
  gate.classList.add('hiding');
  document.body.style.overflow = '';
  setTimeout(function() { gate.remove(); }, 600);
};

/* ── GOOGLE SIGN-IN ───────────────────────────────────────────*/
function renderGateGoogleBtn() {
  var wrap = document.getElementById('hrs-gate-google-btn');
  if (!wrap || !window.google) return;
  wrap.innerHTML = '';
  google.accounts.id.renderButton(wrap, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: 280
  });
}

function handleGoogleCredential(response) {
  try {
    var payload = JSON.parse(
      atob(response.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))
    );
    var profile = {
      name:    payload.name,
      email:   payload.email,
      picture: payload.picture
    };

    // Save as signed-in user (skip gate on return visits)
    setSignedInUser(profile);
    recordVisitor(profile);
    showGateSuccess(profile);

    // Refresh admin visitors tab if open
    if (document.getElementById('tab-visitors') &&
        document.getElementById('tab-visitors').classList.contains('active')) {
      renderVisitorsTab();
    }
  } catch(err) {
    console.error('[Visitor Gate] Failed to decode credential:', err);
  }
}

function showGateSuccess(profile) {
  // Hide the sign-in form, show success
  var googleBtnEl = document.getElementById('hrs-gate-google-btn');
  var divider = document.querySelector('.hrs-gate-divider');
  var sub = document.querySelector('.hrs-gate-sub');
  if (googleBtnEl) googleBtnEl.style.display = 'none';
  if (divider)     divider.style.display = 'none';
  if (sub)         sub.style.display = 'none';

  var success = document.getElementById('hrs-gate-success');
  var avatar  = document.getElementById('hrs-gate-avatar');
  var welcome = document.getElementById('hrs-gate-welcome');

  if (avatar)  avatar.src = profile.picture || '';
  if (welcome) welcome.textContent = 'Hi, ' + (profile.name.split(' ')[0]) + '! 👋';
  if (success) success.classList.add('show');

  // Auto-enter after 2.5 seconds
  setTimeout(function() { hrsEnterPortfolio(); }, 2500);
}

function initGoogleSignIn() {
  if (!window.google || !window.google.accounts) return;
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE')) {
    console.warn('[Visitor Gate] ⚠️ Set your GOOGLE_CLIENT_ID in visitor-tracker.js');
    // Show a placeholder message in gate
    var wrap = document.getElementById('hrs-gate-google-btn');
    if (wrap) wrap.innerHTML = '<div style="font-family:monospace;font-size:0.72rem;color:#e74c3c;padding:0.8rem;background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.25);border-radius:4px;text-align:left;line-height:1.8;">⚠️ Admin: Set your<br><code style="background:rgba(255,255,255,0.07);padding:0.1rem 0.3rem;border-radius:2px;">GOOGLE_CLIENT_ID</code><br>in visitor-tracker.js</div>';
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    cancel_on_tap_outside: false  // mandatory — can't dismiss
  });

  renderGateGoogleBtn();
}

/* ── ADMIN PANEL — VISITORS TAB ───────────────────────────────*/
function injectVisitorsTab() {
  var tabBar = document.querySelector('.admin-tabs');
  if (tabBar && !document.querySelector('[data-hrs-visitors]')) {
    var btn = document.createElement('button');
    btn.className = 'admin-tab';
    btn.setAttribute('data-hrs-visitors', '1');
    btn.textContent = '👥 Visitors';
    btn.onclick = function() {
      document.querySelectorAll('.admin-tab').forEach(function(t){ t.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(function(s){ s.classList.remove('active'); });
      var sec = document.getElementById('tab-visitors');
      if (sec) { sec.classList.add('active'); renderVisitorsTab(); }
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

function renderVisitorsTab() {
  var container = document.getElementById('visitors-content');
  if (!container) return;

  var visitors = getVisitors();
  var nowTs = Date.now();
  var clientIdSet = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE');

  var warnHTML = clientIdSet ? '' : `
    <div class="vis-setup-warn">
      ⚠️ <strong>Setup needed:</strong> Open <code>visitor-tracker.js</code> and replace<br>
      <code>YOUR_GOOGLE_CLIENT_ID_HERE</code> with your real Client ID.<br>
      <a href="https://console.cloud.google.com/" target="_blank">→ Get a free Google Client ID</a>
    </div>`;

  var listHTML = '';
  if (visitors.length === 0) {
    listHTML = `<div class="vis-empty">
      <span class="vis-empty-icon">🔍</span>
      No visitors yet.<br>Visitors who sign in will appear here.
    </div>`;
  } else {
    listHTML = visitors.map(function(v) {
      var date = new Date(v.time);
      var isNew = (nowTs - date.getTime()) < 3600000;
      var avatarHTML = v.picture
        ? '<img class="vis-avatar" src="' + v.picture + '" alt="" onerror="this.style.display=\'none\'">'
        : '<div class="vis-avatar-placeholder">👤</div>';
      var lastSeen = v.lastSeen ? 'Last: ' + getTimeAgo(new Date(v.lastSeen)) : '';
      return `<div class="vis-card">
        ${avatarHTML}
        <div class="vis-info">
          <div class="vis-name">${v.name}</div>
          <div class="vis-email">✉️ ${v.email}</div>
          <div class="vis-meta">
            <span>${v.device}</span>
            <span>🌐 ${v.browser}</span>
            <span>🔗 ${trimRef(v.ref)}</span>
          </div>
        </div>
        <div class="vis-right">
          ${isNew ? '<span class="vis-new-badge">NEW</span>' : ''}
          <div class="vis-time">
            ${getTimeAgo(date)}<br>
            <span style="font-size:0.6rem;opacity:0.6;">${date.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
          ${(v.visits > 1) ? '<div class="vis-visit-count">🔁 ' + v.visits + ' visits</div>' : ''}
          ${lastSeen ? '<div class="vis-visit-count">' + lastSeen + '</div>' : ''}
        </div>
      </div>`;
    }).join('');
  }

  container.innerHTML = `
    ${warnHTML}
    <div class="vis-header">
      <h3>👥 VISITOR LOG</h3>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span class="vis-count-badge">${visitors.length} visitor${visitors.length !== 1 ? 's' : ''}</span>
        ${visitors.length > 0 ? '<button class="vis-clear-btn" onclick="hrsClearVisitors()">🗑️ Clear All</button>' : ''}
      </div>
    </div>
    <div class="vis-note">
      Visitors must sign in with Google before accessing your portfolio.
      Data is stored only in this browser's localStorage — never on a server.
    </div>
    <div class="vis-list">${listHTML}</div>`;
}

window.hrsClearVisitors = function() {
  if (!confirm('Clear all visitor records? This cannot be undone.')) return;
  saveVisitors([]);
  renderVisitorsTab();
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
  if (!ref || ref === 'Direct') return 'Direct';
  try { return new URL(ref).hostname.replace('www.',''); }
  catch(e) { return ref.slice(0,25); }
}

/* ── PATCH openAdmin ──────────────────────────────────────────*/
(function() {
  var _orig = window.openAdmin;
  window.openAdmin = function() {
    if (_orig) _orig();
    setTimeout(function() {
      injectVisitorsTab();
      // Auto-render if visitors tab is active
      var sec = document.getElementById('tab-visitors');
      if (sec && sec.classList.contains('active')) renderVisitorsTab();
    }, 60);
  };
})();

/* ── HOOK INTO INTRO END ──────────────────────────────────────
   intro.js removes a loading/intro element when done.
   We watch for that, then show the gate.
   Also supports a manual trigger: window.hrsIntroFinished()
──────────────────────────────────────────────────────────────*/
window.hrsIntroFinished = function() {
  showGate();
  // Render Google button now that GSI may be loaded
  if (window.google && window.google.accounts) {
    renderGateGoogleBtn();
  }
};

function watchForIntroEnd() {
  // Common intro element IDs / classes used in portfolio starters
  var introSelectors = ['#intro', '#intro-screen', '#loader', '#preloader',
                        '.intro', '.intro-screen', '.loader', '.preloader'];

  var introEl = null;
  for (var i = 0; i < introSelectors.length; i++) {
    introEl = document.querySelector(introSelectors[i]);
    if (introEl) break;
  }

  if (introEl) {
    // Watch for it being hidden/removed
    var observer = new MutationObserver(function(mutations) {
      var el = document.querySelector(introSelectors.join(','));
      if (!el || el.style.display === 'none' || el.style.opacity === '0' ||
          el.classList.contains('hidden') || el.classList.contains('done')) {
        observer.disconnect();
        setTimeout(window.hrsIntroFinished, 300);
      }
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    // Fallback: if intro takes more than 8s, show gate anyway
    setTimeout(function() {
      observer.disconnect();
      if (document.getElementById('hrs-signin-gate') &&
          !document.getElementById('hrs-signin-gate').classList.contains('visible')) {
        window.hrsIntroFinished();
      }
    }, 8000);
  } else {
    // No intro found — show gate after short delay
    setTimeout(window.hrsIntroFinished, 800);
  }
}

/* ── INIT ─────────────────────────────────────────────────────*/
function init() {
  injectStyles();

  // Check if this visitor already signed in before (returning visitor)
  var existingUser = getSignedInUser();
  if (existingUser) {
    // Returning visitor — record the visit silently and skip gate
    recordVisitor(existingUser);
    return; // No gate shown
  }

  // New visitor — build gate and wait for intro
  buildGate();

  // Load Google Identity Services
  var gsi = document.createElement('script');
  gsi.src = 'https://accounts.google.com/gsi/client';
  gsi.async = true;
  gsi.defer = true;
  gsi.onload = function() {
    initGoogleSignIn();
  };
  document.head.appendChild(gsi);

  watchForIntroEnd();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
