/**
 * logo_shine.js
 * Golden shine sweep animation for the site header logo (#site-header-logo-img)
 * and the intro/cinema logo (#ci-logo-img / #ci-logo-wrap).
 * Triggers every 5 seconds.
 */
(function () {
  var INTERVAL   = 5000;   // ms between each shine
  var DURATION   = 800;    // ms for one sweep
  var SHINE_W    = 0.35;   // width of shine band as fraction of element width

  /**
   * Attach a shine overlay canvas on top of a target element.
   * The canvas is positioned absolutely over the element via a
   * wrapper that is set to position:relative.
   */
  function attachShine(target) {
    if (!target) return;

    /* Make sure the parent can host absolute children */
    var parent = target.parentElement;
    if (!parent) return;

    var existingStyle = window.getComputedStyle(parent).position;
    if (existingStyle === 'static') {
      parent.style.position = 'relative';
    }

    /* Canvas overlay */
    var canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'border-radius:inherit',
      'z-index:10',
      'overflow:hidden',
    ].join(';');
    parent.appendChild(canvas);

    var startTime = null;
    var rafId     = null;
    var nextTimer = null;
    var isRunning = false;

    function sweep(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = elapsed / DURATION; // 0 → 1

      /* Resize canvas to match element */
      var rect = target.getBoundingClientRect();
      var W = rect.width  || target.offsetWidth  || 80;
      var H = rect.height || target.offsetHeight || 80;
      canvas.width  = W;
      canvas.height = H;

      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      /* Clip to a circle if the logo is circular, otherwise rectangle */
      var isCircle = (
        target.style.borderRadius === '50%' ||
        window.getComputedStyle(target).borderRadius === '50%'
      );
      ctx.save();
      if (isCircle) {
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, Math.min(W, H) / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      /* Shine x: travels from -(band) to W+(band) */
      var bandW = W * SHINE_W;
      var x     = -bandW + (W + bandW * 2) * progress;

      var grad = ctx.createLinearGradient(x - bandW, 0, x + bandW, H);
      grad.addColorStop(0,    'rgba(255,255,255,0)');
      grad.addColorStop(0.3,  'rgba(255,240,160,0.15)');
      grad.addColorStop(0.5,  'rgba(255,255,255,0.65)');
      grad.addColorStop(0.7,  'rgba(255,240,160,0.15)');
      grad.addColorStop(1,    'rgba(255,255,255,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      if (progress < 1) {
        rafId = requestAnimationFrame(sweep);
      } else {
        ctx.clearRect(0, 0, W, H);
        isRunning  = false;
        startTime  = null;
        scheduleNext();
      }
    }

    function triggerShine() {
      if (isRunning) return;
      isRunning = true;
      startTime = null;
      rafId = requestAnimationFrame(sweep);
    }

    function scheduleNext() {
      nextTimer = setTimeout(triggerShine, INTERVAL);
    }

    /* Start after a short delay so the page has settled */
    setTimeout(function () {
      triggerShine();
    }, 1000);
  }

  /* ── Targets ── */

  /* 1. Site header logo image */
  function tryHeaderLogo() {
    var img = document.getElementById('site-header-logo-img');
    if (img && img.src && img.style.display !== 'none') {
      attachShine(img);
      return true;
    }

    /* If logo is not visible, shine the text brand area instead */
    var brand = document.getElementById('site-header-brand');
    if (brand) {
      attachShine(brand);
      return true;
    }
    return false;
  }

  /* 2. Intro/cinema logo wrap (#ci-logo-inner holds the actual img or SVG) */
  function tryIntroLogo() {
    var inner = document.getElementById('ci-logo-inner');
    if (inner) {
      attachShine(inner);
    }
  }

  /* Wait for DOM, then try immediately; retry for the header logo
     because it may be populated by main.js after load. */
  function init() {
    tryIntroLogo();

    if (!tryHeaderLogo()) {
      /* Retry up to ~3 s in case main.js sets the logo src late */
      var attempts = 0;
      var retry = setInterval(function () {
        attempts++;
        if (tryHeaderLogo() || attempts >= 30) {
          clearInterval(retry);
        }
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
