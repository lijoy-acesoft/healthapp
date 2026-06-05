/* ── GSAP scroll & cinematic animations ── */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const EASE = {
    cinematic: 'power4.out',
    smooth: 'power2.inOut',
    snap: 'back.out(1.4)'
  };

  function revealStatic() {
    gsap.set('[data-hero-animate], [data-hero-word], [data-hero-metric], [data-hero-cta], [data-hero-pill]', {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateX: 0,
      clearProps: 'transform,filter'
    });
    gsap.set('[data-hero-line]', { scaleX: 1 });
    gsap.set('[data-hero-bg], [data-hero-scroll-cue], [data-hero-progress]', { opacity: 1, clearProps: 'all' });
    const comparisonMatrix = document.querySelector('[data-comparison-matrix]');
    if (comparisonMatrix) {
      comparisonMatrix.classList.add('comparison--static');
      gsap.set('[data-comparison-row]', { opacity: 1, y: 0, clearProps: 'all' });
    }
    const profilesGrid = document.querySelector('[data-profiles-grid]');
    if (profilesGrid) {
      profilesGrid.classList.add('profiles--static');
      gsap.set('[data-profile-card]', { opacity: 1, y: 0, clearProps: 'all' });
    }
    const dashboardLayout = document.querySelector('[data-dashboard-layout]');
    if (dashboardLayout) {
      dashboardLayout.classList.add('dashboard--static');
      gsap.set('[data-dash-panel]', { opacity: 1, y: 0, clearProps: 'all' });
      document.querySelectorAll('[data-bar-h]').forEach((bar) => {
        bar.style.height = `${bar.dataset.barH}%`;
      });
      document.querySelectorAll('[data-dash-count]').forEach((el) => {
        el.textContent = Number(el.dataset.countTo || 0).toLocaleString();
      });
    }
    const aiGrid = document.querySelector('[data-ai-grid]');
    if (aiGrid) {
      aiGrid.classList.add('ai--static');
      gsap.set('[data-ai-card]', { opacity: 1, y: 0, clearProps: 'all' });
    }
    const whyWrap = document.querySelector('[data-why-wrap]');
    if (whyWrap) {
      whyWrap.classList.add('why--static');
      gsap.set('[data-why-stat], [data-why-cert]', { opacity: 1, y: 0, clearProps: 'all' });
    }
    document.documentElement.classList.add('gsap-ready');
  }

  function initChrome() {
    const chromeTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    chromeTl
      .from('.top-contact-bar', { y: -8, opacity: 0, duration: 0.25 })
      .from('.nav', { y: -12, opacity: 0, duration: 0.3 }, '-=0.18');
    return chromeTl;
  }

  function initHeroEntrance() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const words = hero.querySelectorAll('[data-hero-word]');
    const metrics = hero.querySelectorAll('[data-hero-metric]');
    const ctas = hero.querySelectorAll('[data-hero-cta]');
    const pills = hero.querySelectorAll('[data-hero-pill]');
    const eyebrow = hero.querySelector('.hero__eyebrow-v2');
    const subtitle = hero.querySelector('.hero__subtitle');
    const profiles = hero.querySelector('.hero__profiles');
    const interactHint = hero.querySelector('.hero__interact-hint');
    const eyebrowLine = hero.querySelector('[data-hero-line]');
    const scrollCue = hero.querySelector('[data-hero-scroll-cue]');
    const countEl = hero.querySelector('[data-count]');
    const fadeBlocks = [eyebrow, subtitle, profiles, interactHint].filter(Boolean);

    gsap.set('[data-hero-bg]', { opacity: 0.6, scale: 1.02 });
    gsap.set('[data-hero-glow]', { opacity: 0.5, scale: 0.98 });
    gsap.set('[data-hero-grid]', { opacity: 0.5 });
    gsap.set('[data-hero-vignette]', { opacity: 0.7 });
    gsap.set(words, { opacity: 0, y: 22, rotateX: -12, transformOrigin: '50% 100%' });
    gsap.set(fadeBlocks, { opacity: 0, y: 14 });
    gsap.set(metrics, { opacity: 0, y: 12, scale: 0.97 });
    gsap.set(ctas, { opacity: 0, y: 10, scale: 0.98 });
    gsap.set(pills, { opacity: 0, y: 8, scale: 0.98 });
    if (eyebrowLine) gsap.set(eyebrowLine, { scaleX: 0, transformOrigin: 'left center' });
    if (scrollCue) gsap.set(scrollCue, { opacity: 0, y: 6 });

    const enterTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => document.documentElement.classList.add('gsap-ready')
    });

    enterTl
      .to('[data-hero-bg]', { opacity: 1, scale: 1, duration: 0.35 }, 0)
      .to('[data-hero-glow]', { opacity: 1, scale: 1, duration: 0.35 }, 0)
      .to('[data-hero-grid]', { opacity: 0.85, duration: 0.35 }, 0)
      .to('[data-hero-vignette]', { opacity: 1, duration: 0.35 }, 0)
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.3 }, 0.05);

    if (eyebrowLine) {
      enterTl.to(eyebrowLine, { scaleX: 1, duration: 0.28, ease: EASE.smooth }, 0.08);
    }

    enterTl
      .to(words, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.38,
        stagger: 0.035
      }, 0.1)
      .to(subtitle, { opacity: 1, y: 0, duration: 0.3 }, 0.18)
      .to(metrics, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.28,
        stagger: 0.04
      }, 0.22)
      .to(ctas, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.26,
        stagger: 0.04
      }, 0.26)
      .to(profiles, { opacity: 1, y: 0, duration: 0.28 }, 0.3)
      .to(pills, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.24,
        stagger: 0.035
      }, 0.32)
      .to(interactHint, { opacity: 1, y: 0, duration: 0.26 }, 0.34);

    if (scrollCue) {
      enterTl.to(scrollCue, { opacity: 1, y: 0, duration: 0.28 }, 0.36);
    }

    if (countEl) {
      const target = parseInt(countEl.dataset.count, 10);
      const counter = { val: 0 };
      enterTl.to(counter, {
        val: target,
        duration: 0.55,
        ease: 'power2.out',
        onUpdate: () => {
          countEl.textContent = `${Math.round(counter.val)}+`;
        }
      }, 0.22);
    }

    gsap.to('[data-hero-glow]', {
      opacity: 0.75,
      scale: 1.08,
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    return enterTl;
  }

  function initHeroScroll() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const pinDistance = isMobile ? '+=70%' : '+=110%';
    const content = hero.querySelector('[data-hero-content]');
    const progressBar = hero.querySelector('[data-hero-progress]');
    const scrollCue = hero.querySelector('[data-hero-scroll-cue]');
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: pinDistance,
        pin: true,
        scrub: 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    scrollTl
      .fromTo(progressBar, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
      .to(content, {
        y: isMobile ? -48 : -96,
        opacity: 0,
        scale: 0.94,
        filter: 'blur(6px)',
        ease: 'none'
      }, 0)
      .to('[data-hero-grid]', { y: -40, opacity: 0.35, ease: 'none' }, 0)
      .to('[data-hero-glow]', { y: 30, scale: 1.2, opacity: 0.5, ease: 'none' }, 0)
      .to('[data-hero-vignette]', { opacity: 1, ease: 'none' }, 0)
      .to('[data-hero-bg]', { scale: 1.1, ease: 'none' }, 0);

    if (scrollCue) {
      scrollTl.to(scrollCue, { opacity: 0, y: 24, ease: 'none' }, 0);
    }

    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top',
      onLeave: () => hero.classList.add('hero--exited'),
      onEnterBack: () => hero.classList.remove('hero--exited')
    });
  }

  function initHeroParallax() {
    const hero = document.getElementById('hero');
    const parallax = hero && hero.querySelector('[data-hero-parallax]');
    if (!hero || !parallax || isMobile) return;

    const quickX = gsap.quickTo(parallax, 'x', { duration: 0.8, ease: 'power3.out' });
    const quickY = gsap.quickTo(parallax, 'y', { duration: 0.8, ease: 'power3.out' });

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(nx * 14);
      quickY(ny * 10);
    });

    hero.addEventListener('mouseleave', () => {
      quickX(0);
      quickY(0);
    });
  }

  function setStackProgress(el, value, axis) {
    if (!el) return;
    if (axis === 'x') {
      gsap.set(el, { scaleX: value, scaleY: 1, transformOrigin: 'left center' });
      return;
    }
    if (window.matchMedia('(max-width: 1024px)').matches) {
      gsap.set(el, { scaleX: value, scaleY: 1, transformOrigin: 'left center' });
    } else {
      gsap.set(el, { scaleY: value, scaleX: 1, transformOrigin: 'top center' });
    }
  }

  function initCardStack(config) {
    const {
      layout,
      cards,
      progress,
      dots,
      barAttr,
      staticClass,
      axis = 'y',
      scrollPerStep = isMobile ? 72 : 92
    } = config;

    if (!layout || !cards.length) return null;

    if (prefersReduced) {
      layout.classList.add(staticClass);
      gsap.set(cards, { clearProps: 'all', opacity: 1, x: 0, y: 0, scale: 1 });
      cards.forEach((card) => card.classList.add('is-active'));
      return null;
    }

    const enterOffset = isMobile ? 22 : 28;
    const exitOffset = isMobile ? -14 : -18;
    const holdRatio = 0.54;
    const transStart = holdRatio;
    const transDur = 0.42;
    const transEase = 'power3.inOut';
    const activeSwitch = transStart + transDur * 0.48;
    const totalScroll = Math.max(1, cards.length - 1) * scrollPerStep;
    const posKey = axis === 'x' ? 'x' : 'y';

    const setActiveState = (index) => {
      if (dots) {
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      }
      cards.forEach((card, i) => {
        card.classList.toggle('is-active', i === index);
        card.classList.toggle('is-stacked', false);
      });
    };

    const getActiveIndex = (progress) => {
      if (cards.length === 1) return 0;
      const pos = progress * (cards.length - 1);
      const base = Math.floor(pos);
      const frac = pos - base;
      if (base >= cards.length - 1) return cards.length - 1;
      return frac < activeSwitch ? base : Math.min(cards.length - 1, base + 1);
    };

    const hiddenState = (offset = enterOffset) => ({
      autoAlpha: 0,
      pointerEvents: 'none',
      [posKey]: offset
    });

    cards.forEach((card, i) => {
      gsap.set(card, {
        zIndex: i + 1,
        x: 0,
        y: 0,
        autoAlpha: i === 0 ? 1 : 0,
        scale: 1,
        force3D: true,
        [posKey]: i === 0 ? 0 : enterOffset,
        pointerEvents: i === 0 ? 'auto' : 'none'
      });
      const bar = card.querySelector(barAttr);
      if (bar) gsap.set(bar, { scaleX: i === 0 ? 1 : 0, transformOrigin: 'left center' });
    });

    setActiveState(0);
    setStackProgress(progress, 0, axis);

    const stackTl = gsap.timeline({
      scrollTrigger: {
        trigger: layout,
        start: 'top 18%',
        end: `+=${totalScroll}%`,
        pin: layout,
        scrub: 1.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setActiveState(getActiveIndex(self.progress));
          setStackProgress(progress, self.progress, axis);
        }
      }
    });

    for (let step = 1; step < cards.length; step++) {
      const at = step - 1;
      const prev = cards[step - 1];
      const current = cards[step];
      const prevBar = prev.querySelector(barAttr);
      const currentBar = current.querySelector(barAttr);
      const transEnd = at + transStart + transDur;

      stackTl.set(prev, {
        autoAlpha: 1,
        [posKey]: 0,
        pointerEvents: 'auto',
        zIndex: step
      }, at);

      stackTl.set(current, { ...hiddenState(), zIndex: step + 1 }, at);
      stackTl.set(cards.slice(step + 1), hiddenState(), at);

      stackTl.set(current, { zIndex: step + 2 }, at + transStart);

      stackTl.to(prev, {
        autoAlpha: 0,
        [posKey]: exitOffset,
        pointerEvents: 'none',
        duration: transDur,
        ease: transEase
      }, at + transStart);

      stackTl.fromTo(
        current,
        { autoAlpha: 0, [posKey]: enterOffset, pointerEvents: 'none' },
        {
          autoAlpha: 1,
          [posKey]: 0,
          pointerEvents: 'auto',
          duration: transDur,
          ease: transEase
        },
        at + transStart
      );

      stackTl.set(prev, { ...hiddenState(), zIndex: step }, transEnd);

      if (prevBar) {
        stackTl.to(prevBar, { scaleX: 0, duration: transDur, ease: transEase }, at + transStart);
      }

      if (currentBar) {
        stackTl.fromTo(
          currentBar,
          { scaleX: 0 },
          { scaleX: 1, duration: transDur, ease: transEase },
          at + transStart
        );
      }
    }

    return stackTl;
  }

  function initSolveStack() {
    return initCardStack({
      layout: document.querySelector('[data-solve-layout]'),
      cards: gsap.utils.toArray('[data-solve-card]'),
      progress: document.querySelector('[data-solve-progress]'),
      dots: gsap.utils.toArray('[data-solve-dot]'),
      barAttr: '[data-solve-bar]',
      staticClass: 'solve__stack--static',
      axis: 'y'
    });
  }

  function initKeyFeaturesStack() {
    return initCardStack({
      layout: document.querySelector('[data-kf-layout]'),
      cards: gsap.utils.toArray('[data-kf-card]'),
      progress: document.querySelector('[data-kf-progress]'),
      dots: gsap.utils.toArray('[data-kf-dot]'),
      barAttr: '[data-kf-bar]',
      staticClass: 'key-features__stack--static',
      axis: 'x'
    });
  }

  function initFeaturesScroll() {
    const layout = document.querySelector('[data-features-layout]');
    const pin = document.querySelector('[data-features-pin]');
    const tabs = gsap.utils.toArray('[data-feat-tab]');
    const panels = gsap.utils.toArray('[data-feat-panel]');
    const progress = document.querySelector('[data-features-progress]');
    const marker = document.querySelector('[data-features-marker]');
    const counter = document.querySelector('[data-features-counter]');
    const railTrack = document.querySelector('.features__rail-track');

    if (!layout || !pin || !panels.length) return null;

    const bindStepClicks = (onSelect) => {
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => onSelect(i));
      });
    };

    if (prefersReduced) {
      layout.classList.add('features--static');
      panels.forEach((panel) => panel.classList.add('is-active'));
      bindStepClicks((index) => {
        tabs.forEach((tab, i) => tab.classList.toggle('is-active', i === index));
        if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      });
      return null;
    }

    const scrollPerStep = isMobile ? 58 : 72;
    const enterOffset = isMobile ? 32 : 44;
    const exitOffset = isMobile ? -24 : -32;
    const holdRatio = 0.62;
    const exitStart = holdRatio;
    const enterStart = 0.8;
    const exitDur = 0.14;
    const enterDur = 0.16;
    const totalScroll = Math.max(1, panels.length - 1) * scrollPerStep;

    const hiddenState = {
      autoAlpha: 0,
      y: enterOffset,
      pointerEvents: 'none'
    };

    const updateMarker = (index) => {
      if (!marker || !railTrack || !tabs[index] || window.matchMedia('(max-width: 1024px)').matches) return;
      const trackRect = railTrack.getBoundingClientRect();
      const stepRect = tabs[index].getBoundingClientRect();
      const y = stepRect.top + stepRect.height / 2 - trackRect.top;
      gsap.set(marker, { y });
    };

    const setActiveState = (index) => {
      tabs.forEach((tab, i) => tab.classList.toggle('is-active', i === index));
      panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));
      if (counter) counter.textContent = String(index + 1).padStart(2, '0');
      updateMarker(index);
    };

    const getActiveIndex = (progress) => {
      if (panels.length === 1) return 0;
      const pos = progress * (panels.length - 1);
      const base = Math.floor(pos);
      const frac = pos - base;
      if (base >= panels.length - 1) return panels.length - 1;
      return frac < enterStart ? base : Math.min(panels.length - 1, base + 1);
    };

    const setRailProgress = (value) => {
      if (!progress) return;
      if (window.matchMedia('(max-width: 1024px)').matches) {
        gsap.set(progress, { scaleX: value, scaleY: 1, transformOrigin: 'left center' });
      } else {
        gsap.set(progress, { scaleY: value, scaleX: 1, transformOrigin: 'top center' });
      }
    };

    panels.forEach((panel, i) => {
      gsap.set(panel, {
        zIndex: i + 1,
        autoAlpha: i === 0 ? 1 : 0,
        x: 0,
        y: i === 0 ? 0 : enterOffset,
        scale: 1,
        pointerEvents: i === 0 ? 'auto' : 'none'
      });
      const bar = panel.querySelector('[data-feat-bar]');
      if (bar) gsap.set(bar, { scaleX: i === 0 ? 1 : 0, transformOrigin: 'left center' });
      gsap.set(panel.querySelectorAll('[data-feat-animate]'), { opacity: 1, y: 0, clearProps: 'filter' });
    });

    setActiveState(0);
    setRailProgress(0);

    let featScrollProgress = 0;

    const featTl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top 18%',
        end: `+=${totalScroll}%`,
        pin: pin,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => updateMarker(getActiveIndex(featScrollProgress)),
        onUpdate: (self) => {
          featScrollProgress = self.progress;
          setActiveState(getActiveIndex(self.progress));
          setRailProgress(self.progress);
        }
      }
    });

    for (let step = 1; step < panels.length; step++) {
      const at = step - 1;
      const prev = panels[step - 1];
      const current = panels[step];
      const prevBar = prev.querySelector('[data-feat-bar]');
      const currentBar = current.querySelector('[data-feat-bar]');

      featTl.set(prev, { autoAlpha: 1, y: 0, pointerEvents: 'auto' }, at);

      featTl.to(prev, {
        autoAlpha: 0,
        y: exitOffset,
        pointerEvents: 'none',
        duration: exitDur,
        ease: 'power2.in'
      }, at + exitStart);

      featTl.fromTo(
        current,
        hiddenState,
        {
          autoAlpha: 1,
          y: 0,
          pointerEvents: 'auto',
          zIndex: step + 2,
          duration: enterDur,
          ease: 'power2.out'
        },
        at + enterStart
      );

      featTl.set(panels.slice(step + 1), hiddenState, at);

      if (prevBar) {
        featTl.to(prevBar, { scaleX: 0, duration: exitDur, ease: 'power2.in' }, at + exitStart);
      }

      if (currentBar) {
        featTl.to(currentBar, { scaleX: 1, duration: enterDur, ease: 'power2.out' }, at + enterStart);
      }
    }

    bindStepClicks((index) => {
      const st = featTl.scrollTrigger;
      if (!st || panels.length < 2) return;
      const targetProgress = index / (panels.length - 1);
      const targetY = st.start + targetProgress * (st.end - st.start);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });

    return featTl;
  }

  function initComparisonReveal() {
    const matrix = document.querySelector('[data-comparison-matrix]');
    const head = document.querySelector('[data-comparison-head]');
    const rows = gsap.utils.toArray('[data-comparison-row]');

    if (!matrix || !rows.length) return null;

    if (prefersReduced) {
      matrix.classList.add('comparison--static');
      gsap.set(rows, { clearProps: 'all', opacity: 1, y: 0 });
      return null;
    }

    gsap.set(rows, { opacity: 0, y: 18 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: matrix,
        start: 'top 82%',
        once: true
      }
    });

    if (head) {
      tl.from(head, {
        opacity: 0,
        y: 14,
        duration: 0.45,
        ease: 'power2.out'
      });
    }

    tl.to(rows, {
      opacity: 1,
      y: 0,
      duration: 0.42,
      stagger: 0.06,
      ease: 'power2.out'
    }, head ? '-=0.2' : 0);

    return tl;
  }

  function initDashboardFlow() {
    const layout = document.querySelector('[data-dashboard-layout]');
    const pin = document.querySelector('[data-dashboard-pin]');
    const frame = document.querySelector('[data-dash-frame]');
    const panels = gsap.utils.toArray('[data-dash-panel]');
    const steps = gsap.utils.toArray('[data-dash-step]');
    const navItems = gsap.utils.toArray('[data-dash-tab]');
    const progress = document.querySelector('[data-dashboard-progress]');
    const urlEl = document.querySelector('[data-dash-url]');
    const usePin = !window.matchMedia('(max-width: 1024px)').matches;

    if (!layout || !pin || !panels.length) return null;

    const urls = [
      'app.acesoft.ai/dashboard — Health Overview',
      'app.acesoft.ai/dashboard — Vitals Intelligence',
      'app.acesoft.ai/dashboard — Workforce Analytics'
    ];
    const navIndexByPanel = [0, 1, 3];
    const enterOffset = 32;
    const exitOffset = -24;
    const exitStart = 0.62;
    const enterStart = 0.8;
    const exitDur = 0.14;
    const enterDur = 0.16;
    let lastPanel = -1;
    let dashTl = null;

    const setBarHeights = (panel, animated) => {
      const bars = panel.querySelectorAll('[data-bar-h]');
      bars.forEach((bar) => {
        const target = `${bar.dataset.barH}%`;
        if (animated) {
          gsap.to(bar, { height: target, duration: 0.65, ease: 'power2.out' });
        } else {
          gsap.set(bar, { height: target });
        }
      });
    };

    const animateCounters = (panel) => {
      panel.querySelectorAll('[data-dash-count]').forEach((el) => {
        const to = Number(el.dataset.countTo) || 0;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: to,
          duration: 0.85,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(counter.val).toLocaleString();
          }
        });
      });
    };

    const animateRows = (panel) => {
      const rows = panel.querySelectorAll('[data-dash-row]');
      gsap.fromTo(rows, { opacity: 0, y: 10 }, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power2.out'
      });
    };

    const onPanelActive = (index) => {
      if (index === lastPanel) return;
      lastPanel = index;
      const panel = panels[index];
      if (!panel) return;
      panel.querySelectorAll('[data-dash-count]').forEach((el) => {
        el.textContent = '0';
      });
      panel.querySelectorAll('[data-bar-h]').forEach((bar) => {
        gsap.set(bar, { height: '0%' });
      });
      animateCounters(panel);
      setBarHeights(panel, true);
      animateRows(panel);
    };

    const setActiveState = (index) => {
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
      panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));
      navItems.forEach((item, i) => item.classList.toggle('is-active', i === navIndexByPanel[index]));
      if (urlEl) urlEl.textContent = urls[index] || urls[0];
      onPanelActive(index);
    };

    const setProgress = (value) => {
      if (!progress) return;
      gsap.set(progress, { scaleX: value, transformOrigin: 'left center' });
    };

    const getActiveIndex = (scrollProgress) => {
      if (panels.length === 1) return 0;
      const pos = scrollProgress * (panels.length - 1);
      const base = Math.floor(pos);
      const frac = pos - base;
      if (base >= panels.length - 1) return panels.length - 1;
      return frac < enterStart ? base : Math.min(panels.length - 1, base + 1);
    };

    const hiddenState = {
      autoAlpha: 0,
      y: enterOffset,
      pointerEvents: 'none'
    };

    const switchToPanel = (index) => {
      if (index < 0 || index >= panels.length) return;

      panels.forEach((panel, i) => {
        gsap.to(panel, {
          autoAlpha: i === index ? 1 : 0,
          y: i === index ? 0 : (i < index ? exitOffset : enterOffset),
          pointerEvents: i === index ? 'auto' : 'none',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true
        });
      });

      setProgress(panels.length < 2 ? 0 : index / (panels.length - 1));
      lastPanel = -1;
      setActiveState(index);
    };

    if (prefersReduced) {
      layout.classList.add('dashboard--static');
      panels.forEach((panel) => {
        panel.classList.add('is-active');
        setBarHeights(panel, false);
        panel.querySelectorAll('[data-dash-count]').forEach((el) => {
          el.textContent = Number(el.dataset.countTo || 0).toLocaleString();
        });
      });
      return null;
    }

    panels.forEach((panel, i) => {
      gsap.set(panel, {
        autoAlpha: i === 0 ? 1 : 0,
        y: i === 0 ? 0 : enterOffset,
        pointerEvents: i === 0 ? 'auto' : 'none'
      });
      gsap.set(panel.querySelectorAll('[data-bar-h]'), { height: '0%' });
    });

    if (frame) {
      gsap.set(frame, { opacity: 1, y: 0 });
    }

    lastPanel = -1;
    setActiveState(0);
    setProgress(0);

    if (usePin && panels.length > 1) {
      const scrollPerStep = isMobile ? 58 : 82;
      const totalScroll = (panels.length - 1) * scrollPerStep;
      let dashScrollProgress = 0;
      let lastSyncedIndex = 0;

      dashTl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top 20%',
          end: `+=${totalScroll}%`,
          pin: pin,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            dashScrollProgress = self.progress;
            const nextIndex = getActiveIndex(self.progress);
            if (nextIndex !== lastSyncedIndex) {
              lastSyncedIndex = nextIndex;
              setActiveState(nextIndex);
            }
            setProgress(self.progress);
          }
        }
      });

      for (let step = 1; step < panels.length; step++) {
        const at = step - 1;
        const prev = panels[step - 1];
        const current = panels[step];

        dashTl.set(prev, { autoAlpha: 1, y: 0, pointerEvents: 'auto' }, at);
        dashTl.to(prev, {
          autoAlpha: 0,
          y: exitOffset,
          pointerEvents: 'none',
          duration: exitDur,
          ease: 'power2.in'
        }, at + exitStart);

        dashTl.fromTo(
          current,
          hiddenState,
          {
            autoAlpha: 1,
            y: 0,
            pointerEvents: 'auto',
            duration: enterDur,
            ease: 'power2.out'
          },
          at + enterStart
        );

        dashTl.set(panels.slice(step + 1), hiddenState, at);
      }
    }

    steps.forEach((step, index) => {
      step.addEventListener('click', () => {
        if (dashTl && dashTl.scrollTrigger && panels.length > 1) {
          const st = dashTl.scrollTrigger;
          const targetProgress = index / (panels.length - 1);
          const targetY = st.start + targetProgress * (st.end - st.start);
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          return;
        }
        switchToPanel(index);
      });
    });

    return dashTl;
  }

  function initWhyReveal() {
    const wrap = document.querySelector('[data-why-wrap]');
    const storyPanel = document.querySelector('.why__panel--story');
    const stats = gsap.utils.toArray('[data-why-stat]');
    const certs = gsap.utils.toArray('[data-why-cert]');
    const presence = document.querySelector('[data-why-presence]');

    if (!wrap) return null;

    if (prefersReduced) {
      wrap.classList.add('why--static');
      gsap.set('[data-why-stat], [data-why-cert]', { clearProps: 'all', opacity: 1, y: 0 });
      return null;
    }

    const storyItems = [
      storyPanel?.querySelector('.section-label'),
      storyPanel?.querySelector('.why__logo-link'),
      storyPanel?.querySelector('.h2'),
      storyPanel?.querySelector('.why__copy')
    ].filter(Boolean);

    gsap.set(storyItems, { opacity: 0, y: 20 });
    gsap.set(certs, { opacity: 0, y: 16 });
    if (presence) gsap.set(presence, { opacity: 0, y: 16 });
    gsap.set(stats, { opacity: 0, y: 24 });
    stats.forEach((stat) => {
      const bar = stat.querySelector('.why-stat__bar');
      if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: 'top 82%',
        once: true
      }
    });

    tl.to(storyItems, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out'
    })
      .to(certs, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.15')
      .to(presence, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        ease: 'power2.out'
      }, '-=0.2')
      .to(stats, {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.09,
        ease: 'power2.out'
      }, '-=0.12');

    stats.forEach((stat, i) => {
      const bar = stat.querySelector('.why-stat__bar');
      if (bar) {
        tl.to(bar, {
          scaleX: 1,
          duration: 0.4,
          ease: 'power2.out'
        }, 0.55 + i * 0.09);
      }
    });

    return tl;
  }

  function initAiReveal() {
    const grid = document.querySelector('[data-ai-grid]');
    const cards = gsap.utils.toArray('[data-ai-card]');

    if (!grid || !cards.length) return null;

    if (prefersReduced) {
      grid.classList.add('ai--static');
      gsap.set(cards, { clearProps: 'all', opacity: 1, y: 0 });
      return null;
    }

    gsap.set(cards, { opacity: 0, y: 32 });
    cards.forEach((card) => {
      const bar = card.querySelector('[data-ai-bar]');
      if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 84%',
        once: true
      }
    });

    tl.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.52,
      stagger: 0.1,
      ease: 'power2.out'
    });

    cards.forEach((card, i) => {
      const bar = card.querySelector('[data-ai-bar]');
      if (bar) {
        tl.to(bar, {
          scaleX: 1,
          duration: 0.45,
          ease: 'power2.out'
        }, 0.15 + i * 0.1);
      }
    });

    return tl;
  }

  function initProfilesReveal() {
    const grid = document.querySelector('[data-profiles-grid]');
    const cards = gsap.utils.toArray('[data-profile-card]');

    if (!grid || !cards.length) return null;

    if (prefersReduced) {
      grid.classList.add('profiles--static');
      gsap.set(cards, { clearProps: 'all', opacity: 1, y: 0 });
      return null;
    }

    gsap.set(cards, { opacity: 0, y: 28 });

    return gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 84%',
        once: true
      }
    }).to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: 'power2.out'
    });
  }

  function initHeroGradientShift() {
    const gradientWords = document.querySelectorAll('.hero__title-gradient[data-hero-word]');
    if (!gradientWords.length) return;

    gradientWords.forEach((word, i) => {
      gsap.to(word, {
        backgroundPosition: '200% center',
        duration: 5 + i * 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  function init() {
    if (prefersReduced) {
      revealStatic();
      return;
    }

    initChrome();
    initHeroEntrance();
    initHeroScroll();
    initHeroParallax();
    initHeroGradientShift();
    initSolveStack();
    initKeyFeaturesStack();
    initFeaturesScroll();
    initComparisonReveal();
    initProfilesReveal();
    initDashboardFlow();
    initAiReveal();
    initWhyReveal();

    window.addEventListener('load', () => ScrollTrigger.refresh());
    window.addEventListener('resize', () => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
