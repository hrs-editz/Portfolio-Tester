/* ================================================================
   HARIHARAN R — PORTFOLIO  |  main.js
   Core logic — render(), admin panel, GitHub sync,
   contact form (EmailJS), scroll & animation observers
================================================================ */

const ADMIN_PASSWORD = 'editor2025';

function render() {
  var headerLogoImg  = document.getElementById('site-header-logo-img');
  var drawerLogoImg  = document.getElementById('drawer-logo-img');
  var drawerLogoText = document.getElementById('drawer-logo-text');
  var hasLogo = DATA.brandLogo && DATA.brandLogo.length > 50;
  if (headerLogoImg) {
    if (hasLogo) {
      headerLogoImg.src = DATA.brandLogo;
      headerLogoImg.style.display = 'inline-block';
      headerLogoImg.style.height = '72px';
      headerLogoImg.style.width = 'auto';
      headerLogoImg.style.objectFit = 'contain';
    } else {
      headerLogoImg.style.display = 'none';
    }
  }
  if (drawerLogoImg && drawerLogoText) {
    if (hasLogo) {
      drawerLogoImg.src = DATA.brandLogo;
      drawerLogoImg.style.display = 'inline-block';
      drawerLogoText.style.display = 'none';
    } else {
      drawerLogoImg.style.display = 'none';
      drawerLogoText.style.display = 'inline';
      drawerLogoText.innerHTML = DATA.name.split(' ')[0].toUpperCase() + '<span style="color:var(--muted)">.</span>EDIT';
    }
  }

  var faviconEl = document.getElementById('dynamic-favicon');
  if (faviconEl && hasLogo) {
    faviconEl.href = DATA.brandLogo;
  }

  var ciLogoImg      = document.getElementById('ci-logo-img');
  var ciLogoFallback = document.getElementById('ci-logo-fallback');
  if (ciLogoImg && ciLogoFallback) {
    if (hasLogo) {
      ciLogoImg.src = DATA.brandLogo;
      ciLogoImg.style.display = 'block';
      ciLogoFallback.style.display = 'none';
    } else {
      ciLogoImg.style.display = 'none';
      ciLogoFallback.style.display = 'block';
    }
  }

  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  function setHTML(id, val) { var el = document.getElementById(id); if (el) el.innerHTML = val; }
  setText('hero-badge', DATA.badge);
  setText('freelance-bar-text', DATA.badge);
  setText('h1-line1', DATA.h1line1);
  setText('h1-line2', DATA.h1line2);
  setText('h1-line3', DATA.h1line3);
  setText('hero-tagline', DATA.tagline);
  setText('stat1n', DATA.stat1n);
  setText('stat1l', DATA.stat1l);
  setText('stat2n', DATA.stat2n);
  setText('stat2l', DATA.stat2l);
  setText('stat3n', DATA.stat3n);
  setText('stat3l', DATA.stat3l);
  const avatarEl = document.getElementById('about-avatar');
  if (avatarEl) {
    if (DATA.avatar && DATA.avatar.startsWith('data:image')) {
      avatarEl.innerHTML = '<img src="' + DATA.avatar + '" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">';
    } else {
      avatarEl.textContent = DATA.avatar;
    }
  }
  setText('about-visual-label', DATA.visualLabel);
  setText('about-heading', DATA.aboutHeading);
  setText('about-p1', DATA.aboutP1);
  setText('about-p2', DATA.aboutP2);
  setText('footer-name', DATA.name);
  setText('contact-title', 'Have a project in mind?');
  setText('contact-tagline', DATA.contactTagline);
  setText('contact-email', DATA.email);
  setText('contact-location', DATA.location);
  setText('contact-availability', DATA.availability);


  const videosHTML = DATA.videos.length === 0
    ? '<p style="color:var(--muted);font-family:var(--font-mono);font-size:0.85rem;padding:2rem 0;">No videos yet. Open the admin panel → Videos tab to add your work.</p>'
    : DATA.videos.map((v,i) => {
        const hasVideo = !!extractDriveId(v.driveUrl || '');
        const isShort = (v.type === 'short');
        const hasPoster = v.posterData && v.posterData.length > 100;
        const thumbHTML = hasPoster
          ? '<img src="' + v.posterData + '" alt="' + v.title + '" style="width:100%;height:100%;object-fit:cover;">'
          : '<div class="video-thumb-placeholder">' + (isShort ? '📱' : '🎬') + '</div>';
        const typeLabel = isShort
          ? '<div style="position:absolute;top:0.6rem;left:0.6rem;background:rgba(0,0,0,0.7);color:var(--accent);font-family:var(--font-mono);font-size:0.62rem;padding:0.2rem 0.5rem;border-radius:2px;letter-spacing:0.06em;">REEL</div>'
          : '';
        return '<div class="video-card' + (isShort ? ' type-short' : '') + '" onclick="openLightbox(' + i + ')" style="' + (!hasVideo ? 'opacity:0.5;pointer-events:none;' : '') + '">' +
          '<div class="video-thumb"' + (isShort ? ' style="aspect-ratio:9/16;"' : '') + '>' + thumbHTML +
          '<div class="video-play-btn"><div class="video-play-icon"><svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg></div></div>' +
          typeLabel +
          (!hasVideo ? '<div style="position:absolute;bottom:0.5rem;left:50%;transform:translateX(-50%);font-family:var(--font-mono);font-size:0.65rem;color:var(--muted);white-space:nowrap;">No video added</div>' : '') +
          '</div>' +
          '<div class="video-info">' +
          '<div class="video-cat">' + v.cat + '</div>' +
          '<div class="video-title">' + v.title + '</div>' +
          '<div class="video-desc">' + v.desc + '</div>' +
          '<div class="video-tags">' + (v.tags||[]).map(t => '<span class="video-tag">' + t + '</span>').join('') + '</div>' +
          '</div></div>';
      }).join('');
  setHTML('videos-container', videosHTML);

  const tagColors = ['tag-gold','tag-red','tag-blue','tag-white'];
  setHTML('hero-tags', DATA.tags.map((t,i)=>`<span class="tag ${tagColors[i%4]}">${t}</span>`).join(''));

  setHTML('about-pills', DATA.pills.map(p=>`<span class="pill">${p}</span>`).join(''));

  const sc = ['s1','s2','s3','s4'];
  setHTML('skills-container', DATA.skills.map((s,i)=>`
    <div class="skill-card ${sc[i%4]}">
      <div class="skill-num">0${i+1}</div>
      <div class="skill-icon">${s.icon}</div>
      <div class="skill-title">${s.title}</div>
      <div class="skill-desc">${s.desc}</div>
      <div class="skill-items">${s.items.map(it=>`<span class="skill-item">${it}</span>`).join('')}</div>
    </div>`).join(''));

  const thumbs = ['t1','t2','t3','t4'];
  setHTML('projects-container', DATA.projects.map((p,i)=>`
    <div class="project-card">
      <div class="project-thumb ${thumbs[i%4]}">
        <span>${p.emoji}</span>
        <span class="project-thumb-label">PROJECT ${String(i+1).padStart(2,'0')}</span>
      </div>
      <div class="project-body">
        <div class="project-cat">${p.cat}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.desc}</div>
        <div class="project-tags">${p.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join(''));

  setHTML('exp-container', DATA.experience.map(e=>`
    <div class="exp-item">
      <div class="exp-year">${e.year}</div>
      <div>
        <div class="exp-role">${e.role}</div>
        <div class="exp-company">${e.company}</div>
        <div class="exp-desc">${e.desc}</div>
      </div>
    </div>`).join(''));

  setHTML('edu-container', DATA.education.map(e=>`
    <div class="edu-card">
      <div class="edu-degree">${e.degree}</div>
      <div class="edu-school">${e.school}</div>
      <div class="edu-year">${e.year}</div>
    </div>`).join(''));

  setHTML('testi-container', DATA.testimonials.map(t=>`
    <div class="testi-card">
      <div class="testi-text">${t.text}</div>
      <div class="testi-author">
        <div class="testi-avatar">${t.initials}</div>
        <div>
          <div class="testi-name">${t.name}</div>
          <div class="testi-role">${t.role}</div>
        </div>
      </div>
    </div>`).join(''));
}

// Migrate old before/after video data to single driveUrl
if (DATA.videos) {
  DATA.videos = DATA.videos.map(function(v) {
    if (!v.driveUrl) {
      v.driveUrl = v.afterDriveUrl || v.beforeDriveUrl || '';
    }
    delete v.beforeDriveUrl;
    delete v.afterDriveUrl;
    return v;
  });
}

render();


function extractDriveId(url) {
  if (!url) return '';
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) return url.trim();
  return '';
}

function driveEmbedUrl(id) {
  return id ? 'https://drive.google.com/file/d/' + id + '/preview?autoplay=0' : '';
}

function buildDriveEmbed(driveUrl, isShort) {
  var id = extractDriveId(driveUrl);
  if (!id) return '';
  var embedUrl = driveEmbedUrl(id);
  var style = isShort
    ? 'width:100%;height:100%;border:none;display:block;'
    : 'width:100%;height:100%;border:none;display:block;';
  return '<div style="position:relative;width:100%;height:100%;">' +
    '<iframe src="' + embedUrl + '" ' +
    'style="' + style + '" ' +
    'allowfullscreen ' +
    'sandbox="allow-scripts allow-same-origin allow-presentation allow-popups">' +
    '</iframe>' +
    '<div style="position:absolute;top:0;right:0;width:70px;height:55px;z-index:10;background:#000;pointer-events:all;cursor:default;"></div>' +
    '</div>';
}

var _lbIdx = 0;

function openLightbox(i) {
  _lbIdx = i;
  var v = DATA.videos[i];
  var isShort = (v.type === 'short');
  var frame    = document.getElementById('video-lightbox-frame');
  var lbInner  = document.getElementById('video-lightbox-inner');
  var hasVideo = !!extractDriveId(v.driveUrl || '');

  if (isShort) {
    frame.classList.add('type-short');
    lbInner.classList.add('type-short');
  } else {
    frame.classList.remove('type-short');
    lbInner.classList.remove('type-short');
  }

  if (!hasVideo) {
    frame.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:1rem;color:var(--muted);font-family:var(--font-mono);font-size:0.85rem;text-align:center;padding:2rem;">📭<br>No video linked yet.<br><span style="font-size:0.72rem;opacity:0.6;">Open admin panel → Videos tab and paste your Google Drive share link.</span></div>';
  } else {
    frame.innerHTML = buildDriveEmbed(v.driveUrl, isShort);
  }

  document.getElementById('video-lightbox-title').textContent = v.title;
  document.getElementById('video-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}


function closeLightbox() {
  document.getElementById('video-lightbox').classList.remove('open');
  document.getElementById('video-lightbox-frame').innerHTML = '';
  document.body.style.overflow = '';
}

document.getElementById('video-lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });
function openDrawer() {
  document.getElementById('nav-drawer').classList.add('open');
  document.getElementById('nav-overlay').classList.add('open');
  document.getElementById('nav-hamburger').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('nav-overlay').classList.remove('open');
  document.getElementById('nav-hamburger').classList.remove('open');
  document.body.style.overflow = '';
}
function updateDrawerLogo() {
  var dli = document.getElementById('drawer-logo-img');
  var dlt = document.getElementById('drawer-logo-text');
  if (!dli || !dlt) return;
  if (DATA.brandLogo && DATA.brandLogo.length > 50) {
    dli.src = DATA.brandLogo;
    dli.style.display = 'inline-block';
    dlt.style.display = 'none';
  } else {
    dli.style.display = 'none';
    dlt.style.display = 'inline';
    dlt.innerHTML = DATA.name.split(' ')[0].toUpperCase() + '<span style="color:var(--muted)">.</span>EDIT';
  }
}

const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
const ringEl = document.getElementById('cursor-ring-el');
if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
  if (dot && ring) {
    document.addEventListener('mousemove', e => {
      dot.style.left = e.clientX + 'px';
      dot.style.top  = e.clientY + 'px';
      ring.style.left = e.clientX + 'px';
      ring.style.top  = e.clientY + 'px';
    });
  }
  if (ringEl) {
    document.querySelectorAll('a,button,.project-card,.skill-card').forEach(el => {
      el.addEventListener('mouseenter', () => ringEl.classList.add('expand'));
      el.addEventListener('mouseleave', () => ringEl.classList.remove('expand'));
    });
  }
} else {
  if (dot) dot.style.display = 'none';
  if (ring) ring.style.display = 'none';
}

function handleLogoUpload(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    DATA.brandLogo = e.target.result;
    var previewWrap = document.getElementById('logo-preview-wrap');
    var previewImg  = document.getElementById('admin-logo-preview');
    var removeBtn   = document.getElementById('logo-remove-btn');
    if (previewImg) previewImg.src = DATA.brandLogo;
    if (previewWrap) previewWrap.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'inline-block';
    render();
    input.value = '';
  };
  reader.readAsDataURL(file);
}

function removeBrandLogo() {
  DATA.brandLogo = '';
  var previewWrap = document.getElementById('logo-preview-wrap');
  var removeBtn   = document.getElementById('logo-remove-btn');
  previewWrap.style.display = 'none';
  removeBtn.style.display = 'none';
  render();
}

let clickCount = 0, clickTimer;
const _editTrigger = document.getElementById('edit-trigger');
if (_editTrigger) _editTrigger.addEventListener('click', () => {
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
  if (clickCount >= 3) { clickCount = 0; openPwd(); }
});
function openPwd() {
  document.getElementById('pwd-prompt').classList.add('open');
  document.getElementById('pwd-input').value = '';
  document.getElementById('pwd-err').style.display = 'none';
  setTimeout(() => document.getElementById('pwd-input').focus(), 100);
}
function closePwd() { document.getElementById('pwd-prompt').classList.remove('open'); }
function checkPwd() {
  if (document.getElementById('pwd-input').value === ADMIN_PASSWORD) { closePwd(); openAdmin(); }
  else { document.getElementById('pwd-err').style.display = 'block'; }
}
const _pwdInput = document.getElementById('pwd-input');
if (_pwdInput) _pwdInput.addEventListener('keydown', e => { if(e.key==='Enter') checkPwd(); });

function openAdmin() { populateAdmin(); document.getElementById('admin-panel').classList.add('open'); }
function closeAdmin() { document.getElementById('admin-panel').classList.remove('open'); }
function switchTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
}
function set(id,val) { const el=document.getElementById(id); if(el) el.value=val; }
function get(id) { const el=document.getElementById(id); return el ? el.value.trim() : ''; }

function populateAdmin() {
  var previewWrap = document.getElementById('logo-preview-wrap');
  var previewImg  = document.getElementById('admin-logo-preview');
  var removeBtn   = document.getElementById('logo-remove-btn');
  if (DATA.brandLogo && DATA.brandLogo.length > 50) {
    previewImg.src = DATA.brandLogo;
    previewWrap.style.display = 'block';
    removeBtn.style.display = 'inline-block';
  } else {
    previewWrap.style.display = 'none';
    removeBtn.style.display = 'none';
  }

  set('edit-name', DATA.name); set('edit-badge', DATA.badge);
  set('edit-h1-line1', DATA.h1line1); set('edit-h1-line2', DATA.h1line2); set('edit-h1-line3', DATA.h1line3);
  set('edit-tagline', DATA.tagline); set('edit-tags', DATA.tags.join(', '));
  set('edit-s1n',DATA.stat1n); set('edit-s1l',DATA.stat1l);
  set('edit-s2n',DATA.stat2n); set('edit-s2l',DATA.stat2l);
  set('edit-s3n',DATA.stat3n); set('edit-s3l',DATA.stat3l);
  set('edit-avatar', DATA.avatar); set('edit-visual-label', DATA.visualLabel);
  set('edit-about-heading', DATA.aboutHeading);
  set('edit-about-p1', DATA.aboutP1); set('edit-about-p2', DATA.aboutP2);
  set('edit-pills', DATA.pills.join(', '));
  set('edit-email', DATA.email); set('edit-location', DATA.location);
  set('edit-avail', DATA.availability); set('edit-contact-tagline', DATA.contactTagline);
  set('edit-ejs-pubkey', DATA.emailjsPublicKey);
  set('edit-ejs-service', DATA.emailjsServiceId);
  set('edit-ejs-template', DATA.emailjsTemplateId);
  renderVideoEditor();
  renderSkillsEditor(); renderProjectsEditor(); renderExpEditor(); renderEduEditor(); renderTestiEditor();
}


function renderVideoEditor() {
  const c = document.getElementById('videos-editor');
  if (!c) return;
  c.innerHTML = '';
  DATA.videos.forEach((v, i) => {
    const hasDrive  = !!extractDriveId(v.driveUrl || '');
    const hasPoster = v.posterData && v.posterData.length > 100;

    const driveIdHtml = hasDrive
      ? '<div style="margin-top:0.5rem;padding:0.5rem 0.8rem;background:rgba(232,197,71,0.08);border:1px solid rgba(232,197,71,0.2);border-radius:3px;font-family:var(--font-mono);font-size:0.72rem;color:var(--accent);">✅ Drive ID detected: ' + extractDriveId(v.driveUrl) + '</div>'
      : '';

    c.innerHTML +=
      '<div class="admin-card" id="vid-card-' + i + '">' +
      '<div class="admin-card-header">' +
      '<span class="admin-card-title">Video ' + (i+1) + ': ' + v.title + '</span>' +
      '<button class="admin-btn-remove" onclick="removeVideo(' + i + ')">Remove</button>' +
      '</div>' +

      '<div class="form-group">' +
      '<label>🎬 Video — Google Drive Share Link</label>' +
      '<input type="text" id="vid-drive-url-' + i + '" placeholder="Paste Google Drive share link here..." value="' + (v.driveUrl || '') + '" oninput="previewDriveLink(&apos;drive&apos;,' + i + ')">' +
      '<div id="vid-drive-preview-' + i + '">' + driveIdHtml + '</div>' +
      '</div>' +

      '<div class="form-group">' +
      '<label>🖼️ Thumbnail Image (optional — shown on video card)</label>' +
      '<div class="vid-upload-area" id="vid-poster-area-' + i + '" onclick="document.getElementById(&apos;vid-poster-&apos;+' + i + '+&apos;&apos;).click()">' +
      (hasPoster
        ? '<span style="color:var(--accent)">✅ Thumbnail uploaded</span>'
        : '<span>🖼️ Click to upload thumbnail (JPG/PNG)</span>') +
      '</div>' +
      '<input type="file" id="vid-poster-' + i + '" accept="image/*" style="display:none" onchange="handlePosterFile(event,' + i + ')">' +
      '</div>' +

      '<div class="form-row">' +
      '<div class="form-group"><label>Category</label><input type="text" id="vid-cat-' + i + '" value="' + (v.cat||'') + '"></div>' +
      '<div class="form-group"><label>Title</label><input type="text" id="vid-title-' + i + '" value="' + (v.title||'') + '"></div>' +
      '</div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label>📐 Video Type</label>' +
      '<select id="vid-type-' + i + '" style="width:100%;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:2px;padding:0.8rem 1rem;color:var(--text);font-family:var(--font-body);font-size:0.88rem;outline:none;">' +
      '<option value="video"' + ((!v.type || v.type==='video') ? ' selected' : '') + '>🎬 Video (16:9 landscape)</option>' +
      '<option value="short"' + (v.type==='short' ? ' selected' : '') + '>📱 Short / Reel (9:16 portrait)</option>' +
      '</select></div>' +
      '<div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="vid-tags-' + i + '" value="' + (v.tags||[]).join(', ') + '"></div>' +
      '</div>' +
      '<div class="form-group"><label>Description</label><textarea id="vid-desc-' + i + '" rows="2">' + (v.desc||'') + '</textarea></div>' +
      '</div>';
  });
}

function previewDriveLink(type, i) {
  var inputId = (type === 'drive') ? 'vid-drive-url-' + i : 'vid-' + type + '-url-' + i;
  var previewId = (type === 'drive') ? 'vid-drive-preview-' + i : 'vid-' + type + '-preview-' + i;
  var url = document.getElementById(inputId).value.trim();
  var id = extractDriveId(url);
  var previewEl = document.getElementById(previewId);
  if (id) {
    previewEl.innerHTML = '<div style="margin-top:0.5rem;padding:0.5rem 0.8rem;background:rgba(232,197,71,0.08);border:1px solid rgba(232,197,71,0.2);border-radius:3px;font-family:var(--font-mono);font-size:0.72rem;color:var(--accent);">✅ Drive ID detected: ' + id + '</div>';
  } else if (url.length > 0) {
    previewEl.innerHTML = '<div style="margin-top:0.5rem;padding:0.5rem 0.8rem;background:rgba(192,57,43,0.08);border:1px solid rgba(192,57,43,0.2);border-radius:3px;font-family:var(--font-mono);font-size:0.72rem;color:#e74c3c;">⚠️ Could not detect a Drive file ID. Make sure you paste the share link from Google Drive.</div>';
  } else {
    previewEl.innerHTML = '';
  }
}

function handlePosterFile(event, i) {
  const file = event.target.files[0];
  if (!file) return;
  const area = document.getElementById('vid-poster-area-' + i);
  const reader = new FileReader();
  reader.onload = function(e) {
    DATA.videos[i].posterData = e.target.result;
    area.innerHTML = '<span style="color:var(--accent)">✅ Thumbnail ready — ' + file.name + '</span>';
  };
  reader.readAsDataURL(file);
}

function removeVideo(i) { DATA.videos.splice(i, 1); renderVideoEditor(); }

function addVideo() {
  DATA.videos.push({title:'My Video',cat:'Category',desc:'Describe this video.',tags:['CapCut'],type:'video',driveUrl:'',posterData:''});
  renderVideoEditor();
  setTimeout(() => {
    const cards = document.querySelectorAll('#videos-editor .admin-card');
    if (cards.length) cards[cards.length-1].scrollIntoView({behavior:'smooth'});
  }, 100);
}

function renderSkillsEditor() {
  const c = document.getElementById('skills-editor'); c.innerHTML = '';
  DATA.skills.forEach((s,i) => {
    c.innerHTML += `<div class="admin-card"><div class="admin-card-header"><span class="admin-card-title">Skill ${i+1}: ${s.title}</span><button class="admin-btn-remove" onclick="removeSkill(${i})">Remove</button></div>
      <div class="form-row"><div class="form-group"><label>Icon (emoji)</label><input type="text" id="sk-icon-${i}" value="${s.icon}"></div><div class="form-group"><label>Title</label><input type="text" id="sk-title-${i}" value="${s.title}"></div></div>
      <div class="form-group"><label>Description</label><textarea id="sk-desc-${i}" rows="2">${s.desc}</textarea></div>
      <div class="form-group"><label>Items (comma-separated)</label><input type="text" id="sk-items-${i}" value="${s.items.join(', ')}"></div></div>`;
  });
}
function removeSkill(i) { DATA.skills.splice(i,1); renderSkillsEditor(); }
function addSkillCard() { DATA.skills.push({icon:'⭐',title:'New Skill',desc:'Description.',items:['Tool 1']}); renderSkillsEditor(); }

function renderProjectsEditor() {
  const c = document.getElementById('projects-editor'); c.innerHTML = '';
  DATA.projects.forEach((p,i) => {
    c.innerHTML += `<div class="admin-card"><div class="admin-card-header"><span class="admin-card-title">Project ${i+1}: ${p.title}</span><button class="admin-btn-remove" onclick="removeProject(${i})">Remove</button></div>
      <div class="form-row"><div class="form-group"><label>Emoji</label><input type="text" id="pj-emoji-${i}" value="${p.emoji}"></div><div class="form-group"><label>Category</label><input type="text" id="pj-cat-${i}" value="${p.cat}"></div></div>
      <div class="form-group"><label>Title</label><input type="text" id="pj-title-${i}" value="${p.title}"></div>
      <div class="form-group"><label>Description</label><textarea id="pj-desc-${i}" rows="2">${p.desc}</textarea></div>
      <div class="form-group"><label>Tags (comma-separated)</label><input type="text" id="pj-tags-${i}" value="${p.tags.join(', ')}"></div></div>`;
  });
}
function removeProject(i) { DATA.projects.splice(i,1); renderProjectsEditor(); }
function addProject() { DATA.projects.push({emoji:'🎬',cat:'Category',title:'New Project',desc:'Description.',tags:['Tag']}); renderProjectsEditor(); }

function renderExpEditor() {
  const c = document.getElementById('exp-editor'); c.innerHTML = '';
  DATA.experience.forEach((e,i) => {
    c.innerHTML += `<div class="admin-card"><div class="admin-card-header"><span class="admin-card-title">Job ${i+1}: ${e.role}</span><button class="admin-btn-remove" onclick="removeExp(${i})">Remove</button></div>
      <div class="form-row"><div class="form-group"><label>Years</label><input type="text" id="ex-year-${i}" value="${e.year}"></div><div class="form-group"><label>Company</label><input type="text" id="ex-co-${i}" value="${e.company}"></div></div>
      <div class="form-group"><label>Role</label><input type="text" id="ex-role-${i}" value="${e.role}"></div>
      <div class="form-group"><label>Description</label><textarea id="ex-desc-${i}" rows="2">${e.desc}</textarea></div></div>`;
  });
}
function removeExp(i) { DATA.experience.splice(i,1); renderExpEditor(); }
function addExp() { DATA.experience.push({year:'2024 — Present',role:'New Role',company:'Company',desc:'Description.'}); renderExpEditor(); }

function renderEduEditor() {
  const c = document.getElementById('edu-editor'); c.innerHTML = '';
  DATA.education.forEach((e,i) => {
    c.innerHTML += `<div class="admin-card"><div class="admin-card-header"><span class="admin-card-title">Edu ${i+1}: ${e.degree}</span><button class="admin-btn-remove" onclick="removeEdu(${i})">Remove</button></div>
      <div class="form-group"><label>Degree / Certification</label><input type="text" id="ed-deg-${i}" value="${e.degree}"></div>
      <div class="form-row"><div class="form-group"><label>Institution</label><input type="text" id="ed-school-${i}" value="${e.school}"></div><div class="form-group"><label>Year</label><input type="text" id="ed-year-${i}" value="${e.year}"></div></div></div>`;
  });
}
function removeEdu(i) { DATA.education.splice(i,1); renderEduEditor(); }
function addEdu() { DATA.education.push({degree:'New Degree',school:'Institution',year:'2024'}); renderEduEditor(); }

function renderTestiEditor() {
  const c = document.getElementById('testi-editor'); c.innerHTML = '';
  DATA.testimonials.forEach((t,i) => {
    c.innerHTML += `<div class="admin-card"><div class="admin-card-header"><span class="admin-card-title">Review ${i+1}: ${t.name}</span><button class="admin-btn-remove" onclick="removeTesti(${i})">Remove</button></div>
      <div class="form-group"><label>Quote</label><textarea id="ts-text-${i}" rows="3">${t.text}</textarea></div>
      <div class="form-row"><div class="form-group"><label>Name</label><input type="text" id="ts-name-${i}" value="${t.name}"></div><div class="form-group"><label>Role</label><input type="text" id="ts-role-${i}" value="${t.role}"></div></div>
      <div class="form-group"><label>Initials (2 chars)</label><input type="text" id="ts-init-${i}" value="${t.initials}" maxlength="2"></div></div>`;
  });
}
function removeTesti(i) { DATA.testimonials.splice(i,1); renderTestiEditor(); }
function addTesti() { DATA.testimonials.push({text:'Great work!',name:'Client Name',role:'Job Title',initials:'CN'}); renderTestiEditor(); }

function applyChanges() {
  DATA.name = get('edit-name');
  DATA.badge = get('edit-badge');
  DATA.h1line1 = get('edit-h1-line1'); DATA.h1line2 = get('edit-h1-line2'); DATA.h1line3 = get('edit-h1-line3');
  DATA.tagline = get('edit-tagline');
  DATA.tags = get('edit-tags').split(',').map(s=>s.trim()).filter(Boolean);
  DATA.stat1n = get('edit-s1n'); DATA.stat1l = get('edit-s1l');
  DATA.stat2n = get('edit-s2n'); DATA.stat2l = get('edit-s2l');
  DATA.stat3n = get('edit-s3n'); DATA.stat3l = get('edit-s3l');
  DATA.avatar = get('edit-avatar'); DATA.visualLabel = get('edit-visual-label');
  DATA.aboutHeading = get('edit-about-heading');
  DATA.aboutP1 = get('edit-about-p1'); DATA.aboutP2 = get('edit-about-p2');
  DATA.pills = get('edit-pills').split(',').map(s=>s.trim()).filter(Boolean);
  DATA.email = get('edit-email'); DATA.location = get('edit-location');
  DATA.availability = get('edit-avail'); DATA.contactTagline = get('edit-contact-tagline');
  DATA.emailjsPublicKey = get('edit-ejs-pubkey');
  DATA.emailjsServiceId = get('edit-ejs-service');
  DATA.emailjsTemplateId = get('edit-ejs-template');

  DATA.videos = DATA.videos.map((v,i)=>({
    driveUrl: (document.getElementById('vid-drive-url-'+i) ? document.getElementById('vid-drive-url-'+i).value.trim() : (v.driveUrl||'')),
    posterData: v.posterData || '',
    type: (document.getElementById('vid-type-'+i) ? document.getElementById('vid-type-'+i).value : (v.type||'video')),
    cat: get('vid-cat-'+i),
    title: get('vid-title-'+i),
    desc: get('vid-desc-'+i),
    tags: get('vid-tags-'+i).split(',').map(s=>s.trim()).filter(Boolean)
  }));
  DATA.skills = DATA.skills.map((_,i)=>({
    icon: get(`sk-icon-${i}`), title: get(`sk-title-${i}`),
    desc: get(`sk-desc-${i}`), items: get(`sk-items-${i}`).split(',').map(s=>s.trim()).filter(Boolean)
  }));
  DATA.projects = DATA.projects.map((_,i)=>({
    emoji: get(`pj-emoji-${i}`), cat: get(`pj-cat-${i}`),
    title: get(`pj-title-${i}`), desc: get(`pj-desc-${i}`),
    tags: get(`pj-tags-${i}`).split(',').map(s=>s.trim()).filter(Boolean)
  }));
  DATA.experience = DATA.experience.map((_,i)=>({
    year: get(`ex-year-${i}`), company: get(`ex-co-${i}`),
    role: get(`ex-role-${i}`), desc: get(`ex-desc-${i}`)
  }));
  DATA.education = DATA.education.map((_,i)=>({
    degree: get(`ed-deg-${i}`), school: get(`ed-school-${i}`), year: get(`ed-year-${i}`)
  }));
  DATA.testimonials = DATA.testimonials.map((_,i)=>({
    text: get(`ts-text-${i}`), name: get(`ts-name-${i}`),
    role: get(`ts-role-${i}`), initials: get(`ts-init-${i}`)
  }));

  render();
  saveToLocalStorage();
  const btn = document.querySelector('.admin-save');
  btn.textContent = '⏳ Syncing…'; btn.disabled = true;
  autoSyncToGitHub().then(() => {
    btn.textContent = '✅ Saved & Synced!'; btn.disabled = false;
    setTimeout(() => btn.textContent = '💾 Save Changes', 2200);
  }).catch(() => {
    btn.textContent = '✅ Saved (no sync)'; btn.disabled = false;
    setTimeout(() => btn.textContent = '💾 Save Changes', 2200);
  });
}

async function checkExportSize() {
  applyChanges();
  const bar   = document.getElementById('export-size-bar');
  const label = document.getElementById('export-size-label');
  bar.style.display = 'block';
  label.innerHTML = '⏳ Calculating…';

  const compressed = await compressDataImages(DATA);
  const html  = buildExportHTML(compressed);
  const bytes = new Blob([html]).size;
  const mb    = (bytes / 1024 / 1024).toFixed(2);
  const kb    = (bytes / 1024).toFixed(0);

  let color, msg;
  if (bytes > 3 * 1024 * 1024) {
    color = '#e74c3c';
    msg = '⚠️ <strong>' + mb + ' MB</strong> — Too large for GitHub Pages preview.<br>' +
          'Fix: Use a smaller profile photo (under 200KB). Resize it at <a href="https://squoosh.app" target="_blank" style="color:var(--accent)">squoosh.app</a> before uploading.';
  } else if (bytes > 1 * 1024 * 1024) {
    color = '#f39c12';
    msg = '⚠️ <strong>' + mb + ' MB</strong> — Moderate. Will work on GitHub Pages but may be slow.<br>' +
          'Tip: Use a smaller profile photo for best speed.';
  } else {
    color = '#2ecc71';
    msg = '✅ <strong>' + (bytes > 1024*1024 ? mb + ' MB' : kb + ' KB') + '</strong> — GitHub Pages ready! Safe to export and upload.';
  }

  label.innerHTML = msg;
  bar.style.borderColor = color;
}


function compressImage(dataUrl, maxW, q) {
  return new Promise(resolve => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) { resolve(dataUrl); return; }
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', q));
    };
    img.onerror = () => resolve(''); // drop broken images
    img.src = dataUrl;
  });
}

async function compressDataImages(data) {
  const d = JSON.parse(JSON.stringify(data)); // deep clone, don't mutate live DATA

  if (d.avatar && d.avatar.startsWith('data:image'))
    d.avatar = await compressImage(d.avatar, 300, 0.65);

  for (let i = 0; i < (d.videos||[]).length; i++) {
    const v = d.videos[i];
    if (v.posterData && v.posterData.startsWith('data:image'))
      v.posterData = await compressImage(v.posterData, 600, 0.60);
    delete v.videoData;
    delete v.fileName; delete v.mimeType;
  }

  return d;
}

function buildExportHTML(exportData) {
  var src   = document.documentElement.outerHTML;

  src = src.replace(/<div id="admin-panel"[^>]*class="[^"]*open[^"]*"[^>]*>/g,
    function(m) { return m.replace(/\bopen\b/g, '').replace(/class=" "/, 'class=""'); });
  src = src.replace(/<div id="pwd-prompt"[^>]*class="[^"]*open[^"]*"[^>]*>/g,
    function(m) { return m.replace(/\bopen\b/g, '').replace(/class=" "/, 'class=""'); });

  var block = 'const DATA = ' + JSON.stringify(exportData) + ';';
  var start = src.indexOf('const DATA = {');
  var end   = src.indexOf('const ADMIN_PASSWORD');
  if (start === -1 || end === -1) return src;
  return src.slice(0, start) + block + '\n\n' + src.slice(end);
}

function showSizeBar(bytes, color, msg) {
  const bar   = document.getElementById('export-size-bar');
  const label = document.getElementById('export-size-label');
  if (!bar || !label) return;
  const kb = (bytes / 1024).toFixed(0);
  const mb = (bytes / 1024 / 1024).toFixed(2);
  label.innerHTML = msg + ' &nbsp;|&nbsp; Size: <strong style="color:' + color + '">' +
    (bytes > 1024*1024 ? mb + ' MB' : kb + ' KB') + '</strong>';
  bar.style.display = 'block';
  bar.style.borderColor = color;
}

async function exportHTML() {
  applyChanges();
  var adminEl = document.getElementById('admin-panel');
  var pwdEl   = document.getElementById('pwd-prompt');
  if (adminEl) adminEl.classList.remove('open');
  if (pwdEl)   pwdEl.classList.remove('open');

  const btn = document.querySelector('.admin-export');
  btn.textContent = '⏳ Compressing…'; btn.disabled = true;

  try {
    const compressed = await compressDataImages(DATA);
    const html       = buildExportHTML(compressed);
    const bytes      = new Blob([html]).size;

    if (bytes > 3 * 1024 * 1024) {
      showSizeBar(bytes, '#e74c3c',
        '⚠️ Still large — your profile photo may be very high-res. Try a smaller photo.');
    } else if (bytes > 1 * 1024 * 1024) {
      showSizeBar(bytes, '#f39c12', '⚠️ Moderate size — should work on GitHub Pages');
    } else {
      showSizeBar(bytes, '#2ecc71', '✅ Great — well within GitHub Pages limits');
    }

    const blob = new Blob([html], {type:'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (DATA.name.replace(/\s+/g,'_') || 'portfolio') + '.html';
    a.click();
    btn.textContent = '✅ Exported!';
  } catch(err) {
    console.error(err);
    btn.textContent = '❌ Failed';
  }

  btn.disabled = false;
  setTimeout(() => btn.textContent = '📤 Export HTML', 3000);
}

function toggleSendBtn() {
  var cb  = document.getElementById('tnc-checkbox');
  var btn = document.getElementById('send-btn');
  var lbl = document.getElementById('send-btn-label');
  if (!btn) return;
  btn.disabled = !cb.checked;
  if (lbl) lbl.textContent = cb.checked ? 'Send Message' : 'Send Message';
}
function openTnC() {
  var modal = document.getElementById('tnc-modal');
  if (modal) modal.classList.add('open');
}
function closeTnC() {
  var modal = document.getElementById('tnc-modal');
  if (modal) modal.classList.remove('open');
}
function closeTnCIfOutside(e) {
  if (e.target === document.getElementById('tnc-modal')) closeTnC();
}
function acceptTnC() {
  var cb = document.getElementById('tnc-checkbox');
  if (cb) { cb.checked = true; toggleSendBtn(); }
  closeTnC();
}

async function sendMessage() {
  var tnc = document.getElementById('tnc-checkbox');
  if (tnc && !tnc.checked) return;

  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const errEl   = document.getElementById('form-error');
  const sucEl   = document.getElementById('form-success');
  const btn     = document.getElementById('send-btn');
  const lbl     = document.getElementById('send-btn-label');

  errEl.style.display = 'none'; sucEl.style.display = 'none';
  function showErr(msg) { errEl.textContent = '⚠️ ' + msg; errEl.style.display = 'block'; }

  if (!name)    { showErr('Please enter your name.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('Please enter a valid email.'); return; }
  if (!message) { showErr('Please write a message.'); return; }
  if (!DATA.emailjsPublicKey || DATA.emailjsPublicKey === 'YOUR_PUBLIC_KEY') {
    showErr('Email not configured yet. Open admin panel → Contact tab and enter your EmailJS keys.');
    return;
  }

  if (lbl) lbl.textContent = 'Sending…';
  btn.disabled = true;
  try {
    emailjs.init({ publicKey: DATA.emailjsPublicKey });
    await emailjs.send(DATA.emailjsServiceId, DATA.emailjsTemplateId, {
      from_name: name, from_email: email,
      subject: subject || 'Portfolio Inquiry', message: message
    });
    sucEl.style.display = 'block';
    ['cf-name','cf-email','cf-subject','cf-message'].forEach(id => document.getElementById(id).value = '');
    if (tnc) { tnc.checked = false; toggleSendBtn(); }
  } catch(err) {
    showErr('Failed to send: ' + (err.text || err.message || 'Please try again.'));
    btn.disabled = false;
  }
  if (lbl) lbl.textContent = 'Send Message';
}

var LS_KEY = 'portfolio_data_v1';

function saveToLocalStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(DATA));
  } catch(e) { console.warn('localStorage save failed:', e); }
}

function loadFromLocalStorage() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    var saved = JSON.parse(raw);
    Object.keys(saved).forEach(function(k) { DATA[k] = saved[k]; });
    return true;
  } catch(e) {
    console.warn('localStorage load failed:', e);
    return false;
  }
}

var GH_KEY = 'portfolio_gh_settings';

var GH_DEFAULTS = { user: 'hrs-editz', repo: 'Portfolio', file: 'index.html' };

function saveGitHubSettings() {
  var s = {
    user: (document.getElementById('gh-user').value.trim()) || GH_DEFAULTS.user,
    repo: (document.getElementById('gh-repo').value.trim()) || GH_DEFAULTS.repo,
    file: (document.getElementById('gh-file').value.trim()) || GH_DEFAULTS.file,
    token: document.getElementById('gh-token').value.trim()
  };
  localStorage.setItem(GH_KEY, JSON.stringify(s));
  showGhStatus('✅ Settings saved to this browser.', '#2ecc71');
}

function loadGitHubSettings() {
  try {
    var s = JSON.parse(localStorage.getItem(GH_KEY) || '{}');
    document.getElementById('gh-user').value = s.user || GH_DEFAULTS.user;
    document.getElementById('gh-repo').value = s.repo || GH_DEFAULTS.repo;
    document.getElementById('gh-file').value = s.file || GH_DEFAULTS.file;
    if (s.token) document.getElementById('gh-token').value = s.token;
  } catch(e) {}
}

function getGitHubSettings() {
  try {
    var s = JSON.parse(localStorage.getItem(GH_KEY) || '{}');
    return {
      user:  s.user  || GH_DEFAULTS.user,
      repo:  s.repo  || GH_DEFAULTS.repo,
      file:  s.file  || GH_DEFAULTS.file,
      token: s.token || ''
    };
  } catch(e) { return GH_DEFAULTS; }
}

function showGhStatus(msg, color) {
  var el = document.getElementById('gh-status');
  el.style.display = 'block';
  el.style.background = color === '#e74c3c' ? 'rgba(192,57,43,0.1)' : 'rgba(46,204,113,0.08)';
  el.style.border = '1px solid ' + color + '44';
  el.style.color = color;
  el.innerHTML = msg;
}

async function testGitHubConnection() {
  var s = getGitHubSettings();
  if (!s.token || !s.user || !s.repo) {
    showGhStatus('⚠️ Enter your GitHub Token first.', '#f39c12'); return;
  }
  showGhStatus('🔌 Testing connection…', '#3498db');
  try {
    var r = await fetch('https://api.github.com/repos/' + s.user + '/' + s.repo, {
      headers: { 'Authorization': 'token ' + s.token, 'Accept': 'application/vnd.github.v3+json' }
    });
    var d = await r.json();
    if (r.ok) {
      showGhStatus('✅ Connected to <strong>' + d.full_name + '</strong>. Repo is ' + (d.private ? '🔒 private' : '🌐 public') + '.', '#2ecc71');
    } else {
      showGhStatus('❌ Error: ' + (d.message || 'Connection failed. Check your token and repo name.'), '#e74c3c');
    }
  } catch(e) { showGhStatus('❌ Network error: ' + e.message, '#e74c3c'); }
}

async function publishToGitHub() {
  var adminEl = document.getElementById('admin-panel');
  var pwdEl   = document.getElementById('pwd-prompt');

  if (adminEl) adminEl.classList.add('open');
  if (pwdEl)   pwdEl.classList.remove('open');

  if (typeof switchTab === 'function') switchTab('publish');

  applyChanges();

  var s = getGitHubSettings();
  if (!s.token) {
    showGhStatus('⚠️ Enter your GitHub Personal Access Token below before publishing.', '#f39c12');
    return;
  }

  var publishBtns = document.querySelectorAll('[onclick="publishToGitHub()"]');
  publishBtns.forEach(function(b) { b.disabled = true; b.style.opacity = '0.6'; b.style.cursor = 'not-allowed'; });

  var filePath = s.file || 'index.html';
  var apiBase = 'https://api.github.com/repos/' + s.user + '/' + s.repo + '/contents/' + filePath;
  var headers = {
    'Authorization': 'token ' + s.token,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  showGhStatus('⏳ Compressing and preparing your portfolio…', '#f39c12');

  try {
    var compressed = await compressDataImages(DATA);

    var adminOpenBefore = adminEl && adminEl.classList.contains('open');
    if (adminEl) adminEl.classList.remove('open');
    if (pwdEl)   pwdEl.classList.remove('open');

    var html = buildExportHTML(compressed);

    if (adminEl && adminOpenBefore) adminEl.classList.add('open');

    var encoded = btoa(unescape(encodeURIComponent(html)));

    showGhStatus('⏳ Connecting to GitHub…', '#f39c12');
    var getResp = await fetch(apiBase, { headers: headers });
    var sha = null;
    if (getResp.ok) {
      var fileData = await getResp.json();
      sha = fileData.sha;
    } else if (getResp.status !== 404) {
      var errData = await getResp.json();
      showGhStatus('❌ Could not read file: ' + (errData.message || getResp.status), '#e74c3c');
      publishBtns.forEach(function(b) { b.disabled = false; b.style.opacity = ''; b.style.cursor = ''; });
      return;
    }

    showGhStatus('⏳ Uploading to GitHub — please wait…', '#f39c12');
    var body = {
      message: '🎬 Portfolio update via admin panel',
      content: encoded
    };
    if (sha) body.sha = sha;

    var putResp = await fetch(apiBase, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body)
    });
    var putData = await putResp.json();

    if (putResp.ok) {
      var liveUrl = 'https://' + s.user + '.github.io/' + s.repo + '/';
      showGhStatus(
        '✅ <strong>Published successfully!</strong> Your site is updating now.<br>' +
        '🌐 Live in ~60 seconds: <a href="' + liveUrl + '" target="_blank" style="color:var(--accent);">' + liveUrl + ' ↗</a><br>' +
        '<span style="color:var(--muted);font-size:0.68rem;">Videos synced via Google Drive links — no re-upload needed.</span>',
        '#2ecc71'
      );
      var statusEl = document.getElementById('gh-status');
      if (statusEl) setTimeout(function(){ statusEl.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 100);
    } else {
      showGhStatus('❌ Publish failed: ' + (putData.message || JSON.stringify(putData)), '#e74c3c');
    }
  } catch(e) {
    showGhStatus('❌ Error: ' + e.message, '#e74c3c');
  }

  publishBtns.forEach(function(b) { b.disabled = false; b.style.opacity = ''; b.style.cursor = ''; });
}

async function autoSyncToGitHub() {
  var s = getGitHubSettings();
  if (!s.token || !s.user || !s.repo) return; // not configured, skip silently

  var htmlFile = s.file || 'index.html';
  var folder   = htmlFile.includes('/') ? htmlFile.substring(0, htmlFile.lastIndexOf('/') + 1) : '';
  var dataFile = folder + 'portfolio-data.json';
  var apiBase  = 'https://api.github.com/repos/' + s.user + '/' + s.repo + '/contents/' + dataFile;
  var headers  = {
    'Authorization': 'token ' + s.token,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  var compressed = await compressDataImages(DATA);
  var json       = JSON.stringify(compressed);
  var encoded    = btoa(unescape(encodeURIComponent(json)));

  var sha = null;
  try {
    var getResp = await fetch(apiBase, { headers: headers });
    if (getResp.ok) { var fd = await getResp.json(); sha = fd.sha; }
  } catch(e) {}

  var body = { message: '⚡ Auto-sync portfolio data', content: encoded };
  if (sha) body.sha = sha;

  var putResp = await fetch(apiBase, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
  if (!putResp.ok) throw new Error('GitHub push failed');
}

async function autoFetchFromGitHub() {
  var s = getGitHubSettings();
  if (!s.user || !s.repo) return; // not configured

  var htmlFile = s.file || 'index.html';
  var folder   = htmlFile.includes('/') ? htmlFile.substring(0, htmlFile.lastIndexOf('/') + 1) : '';
  var dataFile = folder + 'portfolio-data.json';

  var rawUrl = 'https://raw.githubusercontent.com/' + s.user + '/' + s.repo + '/main/' + dataFile
             + '?nocache=' + Date.now();
  try {
    var resp = await fetch(rawUrl);
    if (!resp.ok) return;
    var remote = await resp.json();
    Object.keys(remote).forEach(function(k) { DATA[k] = remote[k]; });
    render();
  } catch(e) {
  }
}

(function() {
  var origOpen = window.openAdmin;
  window.openAdmin = function() {
    origOpen();
    loadGitHubSettings();
  };
  autoFetchFromGitHub();
})();
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold: 0.08});
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));