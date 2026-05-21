/* ================================================================
   HARIHARAN R — PORTFOLIO  |  ui.js
   Scroll-to-top button & top progress bar
================================================================ */

(function() {
  var btn = document.getElementById('scroll-top-btn');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 380) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
})();

/* ─────────────────────────────── */

(function() {
  var bar  = document.getElementById('top-progress-bar');
  var fill = document.getElementById('top-progress-fill');
  if (!fill || !bar) return;

  function startProgressBar() {
    bar.classList.add('visible');
    var loadSteps = [[0,'0%'],[200,'30%'],[500,'65%'],[900,'90%'],[1200,'100%']];
    loadSteps.forEach(function(s) {
      setTimeout(function() { fill.style.width = s[1]; }, s[0]);
    });
    setTimeout(function() {
      fill.style.transition = 'width 0.1s linear';
      function updateScroll() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 100;
        fill.style.width = pct + '%';
      }
      window.addEventListener('scroll', updateScroll, { passive: true });
      updateScroll();
    }, 1500);
  }

  function waitForIntro() {
    var intro = document.getElementById('portfolio-intro');
    if (!intro) { startProgressBar(); return; }
    var obs = new MutationObserver(function() {
      if (!document.getElementById('portfolio-intro')) {
        obs.disconnect();
        setTimeout(startProgressBar, 200);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  waitForIntro();
})();