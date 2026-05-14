// ── Photo lightbox ───────────────────────────────────────
(function () {
  const gallery = document.querySelector('.tennis-gallery');
  if (!gallery) return;

  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const btnClose  = document.getElementById('lightbox-close');
  const btnPrev   = document.getElementById('lightbox-prev');
  const btnNext   = document.getElementById('lightbox-next');
  const imgs      = Array.from(gallery.querySelectorAll('img'));
  let current     = 0;

  function show(index) {
    current = (index + imgs.length) % imgs.length;
    lbImg.src = imgs[current].src;
    lbImg.alt = imgs[current].alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    imgs[current].focus();
  }

  imgs.forEach((img, i) => {
    img.setAttribute('tabindex', '0');
    img.addEventListener('click', () => show(i));
    img.addEventListener('keydown', e => { if (e.key === 'Enter') show(i); });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(current - 1));
  btnNext.addEventListener('click', () => show(current + 1));

  // Click backdrop to close
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   show(current - 1);
    if (e.key === 'ArrowRight')  show(current + 1);
  });
})();


// ── Testimonial slider ────────────────────────────────────
(function () {
  const track    = document.getElementById('testimonial-track');
  const prevBtn  = document.getElementById('testimonial-prev');
  const nextBtn  = document.getElementById('testimonial-next');
  const dotsWrap = document.getElementById('testimonial-dots');
  if (!track) return;

  const cards = Array.from(track.children);
  let current  = 0;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dotsWrap.querySelectorAll('.testimonial-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
})();


// ── Active nav link ───────────────────────────────────────
(function () {
  const links = document.querySelectorAll('.nav nav a');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.getAttribute('href') === current) {
      link.style.color = '#222';
      link.style.fontWeight = 'bold';
    }
  });
})();


// ── Resume accordion ──────────────────────────────────────
(function () {
  const triggers = document.querySelectorAll('.entry-trigger');
  const toggleAllBtn = document.getElementById('toggle-all-btn');

  if (!triggers.length) return;

  // Open or close a single entry
  function openEntry(trigger) {
    const body = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!body) return;
    trigger.setAttribute('aria-expanded', 'true');
    body.style.maxHeight = body.scrollHeight + 'px';
  }

  function closeEntry(trigger) {
    const body = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!body) return;
    trigger.setAttribute('aria-expanded', 'false');
    body.style.maxHeight = '0';
  }

  function isOpen(trigger) {
    return trigger.getAttribute('aria-expanded') === 'true';
  }

  // Toggle a single entry on click
  triggers.forEach(trigger => {
    trigger.addEventListener('click', function () {
      if (isOpen(this)) {
        closeEntry(this);
      } else {
        openEntry(this);
      }
      syncToggleAllLabel();
    });

    // Keyboard: also allow Enter / Space (buttons handle these natively,
    // but this ensures arrow-key navigation works in the entry list)
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const entries = Array.from(triggers);
        const next = entries[entries.indexOf(this) + 1];
        if (next) next.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const entries = Array.from(triggers);
        const prev = entries[entries.indexOf(this) - 1];
        if (prev) prev.focus();
      }
    });
  });

  // Expand All / Collapse All
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', function () {
      const allOpen = Array.from(triggers).every(isOpen);
      triggers.forEach(allOpen ? closeEntry : openEntry);
      this.textContent = allOpen ? 'Expand All' : 'Collapse All';
    });
  }

  // Keep the button label in sync after individual toggles
  function syncToggleAllLabel() {
    if (!toggleAllBtn) return;
    const allOpen = Array.from(triggers).every(isOpen);
    toggleAllBtn.textContent = allOpen ? 'Collapse All' : 'Expand All';
  }
})();


// ── Book homepage: parallax, cursor light, page-turn ─────
(function () {
  const book = document.querySelector('.book');
  if (!book) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Cursor-illumination layer ──
  const light = document.querySelector('.book-cursor-light');
  if (light && !reduceMotion) {
    let pending = false;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    function update() {
      light.style.setProperty('--mx', lastX + 'px');
      light.style.setProperty('--my', lastY + 'px');
      pending = false;
    }

    document.addEventListener('mousemove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    // Activate after page settles in
    setTimeout(() => light.classList.add('is-active'), 700);

    // Hide light when cursor leaves the window
    document.addEventListener('mouseleave', () => light.classList.remove('is-active'));
    document.addEventListener('mouseenter', () => light.classList.add('is-active'));
  }

  // ── Title-page parallax ──
  const titlepage = document.getElementById('titlepage');
  if (titlepage && !reduceMotion) {
    const layers = titlepage.querySelectorAll('[data-parallax-depth]');
    let pending = false;
    let cx = 0, cy = 0;

    function applyParallax() {
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.parallaxDepth) || 0;
        const tx = -cx * depth;
        const ty = -cy * depth;
        layer.style.transform = 'translate(' + tx.toFixed(2) + 'px, ' + ty.toFixed(2) + 'px)';
      });
      pending = false;
    }

    titlepage.addEventListener('mousemove', (e) => {
      const rect = titlepage.getBoundingClientRect();
      cx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
      cy = (e.clientY - rect.top) / rect.height - 0.5;
      if (!pending) {
        pending = true;
        requestAnimationFrame(applyParallax);
      }
    }, { passive: true });

    titlepage.addEventListener('mouseleave', () => {
      cx = 0; cy = 0;
      requestAnimationFrame(applyParallax);
    });
  }

  // ── Page-turn transition for chapter links ──
  const chapterLinks = document.querySelectorAll('[data-chapter-link]');
  chapterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Let modified clicks (cmd/ctrl/shift/middle) work normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      // Skip new-tab links
      if (link.target && link.target !== '_self') return;
      if (reduceMotion) return;

      e.preventDefault();
      const href = link.getAttribute('href');
      book.classList.add('is-turning');

      // Navigate after the transform completes; fallback if transitionend doesn't fire
      let navigated = false;
      const go = () => {
        if (navigated) return;
        navigated = true;
        window.location.href = href;
      };
      book.addEventListener('transitionend', (ev) => {
        if (ev.propertyName === 'transform') go();
      }, { once: true });
      setTimeout(go, 480);
    });
  });
})();


// ── Threshold homepage: glow, reveals, soft transitions ──
(function () {
  if (!document.body.classList.contains('is-threshold')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Moonlight cursor glow
  const glow = document.querySelector('.threshold-cursor-glow');
  if (glow && !reduceMotion) {
    let pending = false;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight * 0.4;

    function paint() {
      glow.style.setProperty('--mx', lastX + 'px');
      glow.style.setProperty('--my', lastY + 'px');
      pending = false;
    }

    window.addEventListener('mousemove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!pending) {
        pending = true;
        requestAnimationFrame(paint);
      }
    }, { passive: true });

    // Activate quietly, after the load reveal has settled
    setTimeout(() => glow.classList.add('is-on'), 2400);

    document.addEventListener('mouseleave', () => glow.classList.remove('is-on'));
    document.addEventListener('mouseenter', () => glow.classList.add('is-on'));
  }

  // Reveal reverie fragments as they enter view (with a small stagger)
  const fragments = document.querySelectorAll('.reverie-fragments li');
  if (fragments.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const list = Array.from(fragments);
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const idx = list.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('is-visible'), Math.max(0, idx) * 240);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      fragments.forEach(f => io.observe(f));
    } else {
      fragments.forEach(f => f.classList.add('is-visible'));
    }
  }

  // Scroll-driven theme transition. A quick catch-up filter smooths chunky
  // wheel/trackpad deltas without letting the colors trail behind the page.
  (function () {
    const root = document.body;
    let scrollIdleTimer = 0;
    let targetGlow = 0;
    let targetText = 0;
    let currentGlow = 0;
    let currentText = 0;
    let rafId = 0;
    let lastFrameTime = 0;
    let lastGlow = '';
    let lastText = '';
    let initialized = false;

    function smootherstep(edge0, edge1, x) {
      const u = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
      return u * u * u * (u * (u * 6 - 15) + 10);
    }

    function writeProgress() {
      const glow = currentGlow.toFixed(4);
      const text = currentText.toFixed(4);

      if (glow !== lastGlow) {
        root.style.setProperty('--th-scroll-glow', glow);
        lastGlow = glow;
      }
      if (text !== lastText) {
        root.style.setProperty('--th-scroll-text', text);
        lastText = text;
      }
    }

    function animate(now) {
      const frameMs = lastFrameTime ? Math.min(32, now - lastFrameTime) : 16.7;
      lastFrameTime = now;
      const alpha = 1 - Math.pow(0.64, frameMs / 16.7);

      currentGlow += (targetGlow - currentGlow) * alpha;
      currentText += (targetText - currentText) * alpha;

      const glowDelta = Math.abs(targetGlow - currentGlow);
      const textDelta = Math.abs(targetText - currentText);
      if (glowDelta < 0.0006) currentGlow = targetGlow;
      if (textDelta < 0.0006) currentText = targetText;

      writeProgress();

      if (Math.abs(targetGlow - currentGlow) > 0.0006 ||
          Math.abs(targetText - currentText) > 0.0006) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = 0;
        lastFrameTime = 0;
      }
    }

    function updateTargets() {
      const max = Math.max(1,
        document.documentElement.scrollHeight - window.innerHeight);
      const cur = window.scrollY || document.documentElement.scrollTop || 0;
      const t = Math.min(1, Math.max(0, cur / max));

      targetGlow = smootherstep(0, 1, t);
      targetText = smootherstep(0.20, 1, t);

      if (!initialized) {
        currentGlow = targetGlow;
        currentText = targetText;
        initialized = true;
        writeProgress();
        return;
      }

      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    }

    function queuePaint() {
      root.classList.add('is-scrolling');
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => root.classList.remove('is-scrolling'), 220);
      updateTargets();
    }

    window.addEventListener('scroll', queuePaint, { passive: true });

    window.addEventListener('resize', queuePaint);
    updateTargets();
  })();

  // Soft cross-fade when leaving the homepage
  if (!reduceMotion) {
    document.querySelectorAll('[data-soft-link]').forEach(link => {
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (link.target && link.target !== '_self') return;
        e.preventDefault();
        const href = link.getAttribute('href');
        document.body.classList.add('is-leaving');
        let navigated = false;
        const go = () => {
          if (navigated) return;
          navigated = true;
          window.location.href = href;
        };
        document.body.addEventListener('transitionend', (ev) => {
          if (ev.propertyName === 'opacity') go();
        }, { once: true });
        setTimeout(go, 600);
      });
    });
  }
})();
