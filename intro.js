/* ================================================================
   HARIHARAN R — PORTFOLIO  |  intro.js
   Cinematic film-countdown intro screen
================================================================ */

(function() {
  var intro = document.getElementById('portfolio-intro');
  if (!intro) return;

  /* ── CANVAS: deep-space ambient glow ── */
  var canvas = document.getElementById('ci-canvas');
  var ctx = canvas.getContext('2d');
  var W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);

  var orbs = [];
  for (var i = 0; i < 5; i++) {
    orbs.push({
      x: Math.random(), y: Math.random(),
      r: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.004,
      hue: Math.random() < 0.6 ? '232,197,71' : '200,140,30'
    });
  }
  var raf;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var t = Date.now() / 1000;
    for (var i = 0; i < orbs.length; i++) {
      var o = orbs[i];
      var pulse = 0.5 + 0.5 * Math.sin(t * o.speed * Math.PI * 2 + o.phase);
      var gr = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r * Math.min(W,H) * (0.8 + 0.4*pulse));
      gr.addColorStop(0,   'rgba(' + o.hue + ',' + (0.07 * pulse) + ')');
      gr.addColorStop(0.4, 'rgba(' + o.hue + ',' + (0.04 * pulse) + ')');
      gr.addColorStop(1,   'rgba(' + o.hue + ',0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(draw);
  }
  draw();

  /* ── Typewriter: stamp each char left→right with color class ── */
  var colorClasses = ['c0','c1','c2','c3','c4'];
  function typeChars(el, text, startDelay, charInterval, onDone) {
    var total = text.length;
    text.split('').forEach(function(ch, i) {
      setTimeout(function() {
        var span = document.createElement('span');
        var cls = 'ci-char ' + colorClasses[i % colorClasses.length];
        span.className = cls;
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = '0ms';
        el.appendChild(span);
        if (i === total - 1 && onDone) onDone();
      }, startDelay + i * charInterval);
    });
  }

  /* Type HARIHARAN at 155ms/char starting at 600ms */
  var n1 = document.getElementById('ci-n1');
  var n2 = document.getElementById('ci-n2');
  typeChars(n1, 'HARIHARAN', 600, 155, function() {
    /* After last char of HARIHARAN, type R. slowly with a pause */
    typeChars(n2, 'R.', 500, 320, null);
  });

  /* ── Trigger divider + tagline ── */
  requestAnimationFrame(function() {
    document.getElementById('ci-divider').classList.add('grow');
    document.getElementById('ci-tagline').classList.add('show');
  });

  /* ── Loading bar animation ── */
  var fill   = document.getElementById('ci-loader-fill');
  var pctEl  = document.getElementById('ci-loader-pct');
  var statEl = document.getElementById('ci-loader-status');
  var loadStages = [
    { at: 0,    pct: 0,   label: 'Initializing Portfolio' },
    { at: 600,  pct: 18,  label: 'Loading Assets' },
    { at: 1400, pct: 42,  label: 'Rendering Timeline' },
    { at: 2400, pct: 65,  label: 'Applying Color Grade' },
    { at: 3300, pct: 82,  label: 'Syncing Audio' },
    { at: 4200, pct: 95,  label: 'Finalizing Export' },
    { at: 4800, pct: 100, label: 'Ready' }
  ];
  loadStages.forEach(function(s) {
    setTimeout(function() {
      fill.style.width = s.pct + '%';
      pctEl.textContent = s.pct + '%';
      statEl.textContent = s.label;
    }, s.at);
  });

  /* ── DISMISS after 5 seconds ── */
  function dismiss() {
    cancelAnimationFrame(raf);
    intro.classList.add('exit');
    setTimeout(function() {
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    }, 1100);
  }
  var timer = setTimeout(dismiss, 5000);
  intro.addEventListener('click', function() { clearTimeout(timer); dismiss(); });
})();