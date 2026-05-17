(function () {
  var SIZE = 64;
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  var ctx = canvas.getContext('2d');
  var link = document.getElementById('favicon');

  var img = new Image();
  img.src = 'test.png';

  /* Shine state */
  var shineX      = -40;
  var shineActive = false;
  var shineSpeed  = 1.2;      /* slow sweep */
  var lastTime    = 0;
  var INTERVAL    = 5000;     /* every 5 seconds */
  var started     = false;

  function drawBase() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    var cx = SIZE / 2, cy = SIZE / 2;

    /* clip to circle */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    if (img.complete && img.naturalWidth) {
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
    } else {
      /* fallback — dark circle with gold H */
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#e8c547';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', cx, cy);
    }
    ctx.restore();
  }

  function drawShine() {
    var cx = SIZE / 2, cy = SIZE / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    /* diagonal shine streak */
    var grad = ctx.createLinearGradient(
      shineX - 20, 0,
      shineX + 20, SIZE
    );
    grad.addColorStop(0,    'rgba(255,255,255,0)');
    grad.addColorStop(0.35, 'rgba(255,245,180,0.18)');
    grad.addColorStop(0.5,  'rgba(255,255,255,0.58)');
    grad.addColorStop(0.65, 'rgba(255,245,180,0.18)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(shineX - 30, 0, 70, SIZE);
    ctx.restore();
  }

  function drawRing() {
    /* gold border ring */
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(232,197,71,0.75)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  function animate(timestamp) {
    requestAnimationFrame(animate);

    if (!started) {
      lastTime = timestamp;
      started  = true;
    }

    /* trigger shine every 5s */
    if (!shineActive && timestamp - lastTime >= INTERVAL) {
      shineActive = true;
      shineX      = -40;
    }

    drawBase();

    if (shineActive) {
      drawShine();
      shineX += shineSpeed;
      if (shineX > SIZE + 40) {
        shineActive = false;
        lastTime    = timestamp;
      }
    }

    drawRing();
    link.href = canvas.toDataURL('image/png');
  }

  function start() {
    requestAnimationFrame(animate);
  }

  if (img.complete && img.naturalWidth) {
    start();
  } else {
    img.onload  = start;
    img.onerror = start;
  }
})();