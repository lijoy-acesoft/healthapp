/* ── Canvas particle background ── */
(function () {
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0;
  let H = 0;
  let pts = [];
  let orbs = [];
  let mx = 0;
  let my = 0;
  let tick = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    mx = W / 2;
    my = H / 2;
  }

  function makePts(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.5,
      o: Math.random() * 0.45 + 0.2,
      hue: Math.random() > 0.35 ? '26,107,255' : '13,148,136'
    }));
  }

  function makeOrbs() {
    return [
      { x: 0.18, y: 0.22, r: 220, color: [26, 107, 255], vx: 0.00012, vy: 0.00008, a: 0.07 },
      { x: 0.82, y: 0.68, r: 260, color: [13, 148, 136], vx: -0.0001, vy: -0.00009, a: 0.06 },
      { x: 0.52, y: 0.48, r: 180, color: [99, 102, 241], vx: 0.00008, vy: 0.0001, a: 0.045 }
    ];
  }

  resize();
  pts = makePts(prefersReduced ? 42 : 110);
  orbs = makeOrbs();
  window.addEventListener('resize', () => {
    resize();
    pts = makePts(prefersReduced ? 42 : 110);
  });

  if (!prefersReduced) {
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });
  }

  function drawOrbs() {
    orbs.forEach((orb) => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < 0.05 || orb.x > 0.95) orb.vx *= -1;
      if (orb.y < 0.05 || orb.y > 0.95) orb.vy *= -1;

      const cx = orb.x * W;
      const cy = orb.y * H;
      const pulse = 1 + Math.sin(tick * 0.004 + orb.x * 6) * 0.06;
      const radius = orb.r * pulse;
      const [r, g, b] = orb.color;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(${r},${g},${b},${orb.a})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick += 1;

    drawOrbs();

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          const alpha = 0.1 * (1 - d / 130);
          ctx.strokeStyle = `rgba(26,107,255,${alpha})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    pts.forEach((p) => {
      if (!prefersReduced) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const dx = mx - p.x;
        const dy = my - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 220) {
          p.vx += (dx / d) * 0.012;
          p.vy += (dy / d) * 0.012;
        }
        p.vx *= 0.992;
        p.vy *= 0.992;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.o * 0.65})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

/* ── Feature steps (fallback when GSAP scroll is unavailable) ── */
const featuresLayout = document.querySelector('[data-features-layout]');
const featSteps = document.querySelectorAll('[data-feat-tab]');
const featPanels = document.querySelectorAll('[data-feat-panel]');
const featureSec = document.getElementById('features');
const featCounter = document.querySelector('[data-features-counter]');

if (featureSec && featSteps.length && featPanels.length && !window.gsap) {
  function switchFeatStep(idx) {
    featSteps.forEach((step, i) => step.classList.toggle('is-active', i === idx));
    featPanels.forEach((panel, i) => panel.classList.toggle('is-active', i === idx));
    if (featCounter) featCounter.textContent = String(idx + 1).padStart(2, '0');
  }

  featSteps.forEach((step, i) => {
    step.addEventListener('click', () => switchFeatStep(i));
  });
}

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

document.querySelectorAll('.reveal').forEach(el => {
  if (isInViewport(el)) {
    el.classList.add('visible', 'reveal--instant');
  } else {
    revealObserver.observe(el);
  }
});

/* ── Nav scroll state ── */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(247, 250, 255, .96)';
  } else {
    nav.style.background = 'rgba(247, 250, 255, .9)';
  }
});

/* ── Mobile nav toggle ── */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

if (nav && navToggle && navLinks) {
  const closeNav = () => {
    nav.classList.remove('nav--open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeNav();
  });
}

/* ── Animated numbers ── */
function animateNum(el, target, suffix = '') {
  let start = 0;
  const dur = 1800;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * ease) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const numObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const val = parseInt(el.dataset.val, 10);
      const suffix = el.dataset.suffix || '';
      animateNum(el, val, suffix);
      numObs.unobserve(el);
    }
  });
}, { threshold: .5 });

document.querySelectorAll('[data-val]').forEach(el => numObs.observe(el));

/* ── Go To Top Button ── */
const goTopBtn = document.getElementById('goTopBtn');
if (goTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      goTopBtn.classList.add('visible');
    } else {
      goTopBtn.classList.remove('visible');
    }
  });

  goTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── CTA Connect Form (AJAX) ── */
const connectForm = document.getElementById('connectForm');
const connectFormStatus = document.getElementById('connectFormStatus');

if (connectForm) {
  const startedAtInput = connectForm.querySelector('input[name="form_started_at"]');

  function getRecaptchaApi() {
    if (window.grecaptcha && window.grecaptcha.enterprise) return window.grecaptcha.enterprise;
    if (window.grecaptcha) return window.grecaptcha;
    return null;
  }

  function getRecaptchaToken(formData) {
    const formToken = String(formData.get('g-recaptcha-response') || '').trim();
    if (formToken) return formToken;
    const recaptchaApi = getRecaptchaApi();
    if (recaptchaApi && typeof recaptchaApi.getResponse === 'function') {
      return String(recaptchaApi.getResponse() || '').trim();
    }
    return '';
  }

  function resetRecaptcha() {
    const recaptchaApi = getRecaptchaApi();
    if (recaptchaApi && typeof recaptchaApi.reset === 'function') {
      recaptchaApi.reset();
    }
  }

  if (startedAtInput) startedAtInput.value = String(Date.now());

  connectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const endpoint = connectForm.dataset.endpoint;
    if (!endpoint) {
      if (connectFormStatus) connectFormStatus.textContent = 'Submission endpoint is missing.';
      return;
    }

    const submitBtn = connectForm.querySelector('button[type="submit"]');
    const formData = new FormData(connectForm);
    const recaptchaToken = getRecaptchaToken(formData);
    if (!recaptchaToken) {
      if (connectFormStatus) connectFormStatus.textContent = 'Please complete reCAPTCHA verification.';
      return;
    }

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      phone: formData.get('phone'),
      details: formData.get('details'),
      recaptcha_token: recaptchaToken,
      website: String(formData.get('website') || ''),
      form_started_at: String(formData.get('form_started_at') || '')
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      if (connectFormStatus) connectFormStatus.textContent = 'Submitting your request...';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Request failed');
      const result = await response.json();
      if (result && result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }

      connectForm.reset();
      if (startedAtInput) startedAtInput.value = String(Date.now());
      resetRecaptcha();
      if (connectFormStatus) connectFormStatus.textContent = 'Thank you! We will contact you shortly.';
    } catch (error) {
      resetRecaptcha();
      if (connectFormStatus) connectFormStatus.textContent = 'Unable to submit right now. Please try again.';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
      }
    }
  });
}
