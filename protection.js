/* ================================================================
   HARIHARAN R — PORTFOLIO  |  protection.js
   Right-click / DevTools / selection / drag protection
================================================================ */

var _toastTimer = null;
  function showProtectToast(msg) {
    var toast = document.getElementById('protect-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'protect-toast';
      toast.innerHTML = '<span class="toast-icon">🔒</span><span id="protect-toast-msg"></span>';
      document.body ? document.body.appendChild(toast) : document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(toast); });
    }
    var msgEl = document.getElementById('protect-toast-msg');
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
  }

  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showProtectToast('Right-click is disabled on this page.');
    return false;
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
      e.preventDefault();
      showProtectToast('Developer tools are disabled on this page.');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault();
      showProtectToast('Developer tools are disabled on this page.');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      showProtectToast('Developer tools are disabled on this page.');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      showProtectToast('Inspect element is disabled on this page.');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      showProtectToast('Viewing page source is disabled.');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      showProtectToast('Saving this page is disabled.');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      showProtectToast('Content selection is disabled on this page.');
      return false;
    }
  });

  (function devToolsDetect() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    var threshold = 160;
    var alerted = false;
    function check() {
      var widthDiff  = window.outerWidth  - window.innerWidth  > threshold;
      var heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        if (!alerted) {
          alerted = true;
          document.body.innerHTML = [
            '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;',
            'height:100vh;background:#080808;color:#e8c547;font-family:monospace;',
            'font-size:1.1rem;text-align:center;padding:2rem;gap:1.2rem;">',
            '<div style="font-size:3rem;">🔒</div>',
            '<div style="font-size:1.4rem;font-weight:700;letter-spacing:0.05em;">Access Restricted</div>',
            '<div style="color:#7a7570;font-size:0.9rem;max-width:380px;line-height:1.7;">',
            'Developer tools are not permitted on this page.<br>Please close DevTools to continue.',
            '</div>',
            '<div style="margin-top:0.5rem;padding:0.5rem 1.4rem;border:1px solid rgba(232,197,71,0.3);',
            'border-radius:3px;font-size:0.78rem;color:rgba(232,197,71,0.6);letter-spacing:0.1em;">',
            '© HARIHARAN R — ALL RIGHTS RESERVED',
            '</div></div>'
          ].join('');
        }
      }
    }
    setInterval(check, 1000);
  })();

  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  });
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });