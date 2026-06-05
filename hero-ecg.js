/* ── Hero background — interactive ECG monitor (Three.js) ── */
(function () {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('hero-bg-canvas');
  if (!hero || !canvas || typeof THREE === 'undefined') return;

  const BPM = 72;
  const BEATS_PER_SEC = BPM / 60;
  const SCROLL_PPS = 11;
  const POINT_COUNT = 420;
  const TRACE_WIDTH = 58;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf0f4fa, 0.004);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xf0f4fa, 1);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  const sweepLight = new THREE.PointLight(0x34d399, 1.6, 22);
  sweepLight.position.set(TRACE_WIDTH / 2, 0, 2);
  scene.add(sweepLight);

  const mouseLight = new THREE.PointLight(0x1a6bff, 1.1, 32);
  mouseLight.position.set(0, 0, 5);
  scene.add(mouseLight);

  function ecgSample(phase) {
    const p = phase % 1;
    if (p < 0.06) return 0;
    if (p < 0.09) return 0.11 * Math.sin(((p - 0.06) / 0.03) * Math.PI);
    if (p < 0.13) return 0;
    if (p < 0.145) return -0.14;
    if (p < 0.152) return 1.15;
    if (p < 0.168) return -0.42;
    if (p < 0.3) return 0;
    if (p < 0.38) return 0.18 * Math.sin(((p - 0.3) / 0.08) * Math.PI);
    return 0;
  }

  const gridGroup = new THREE.Group();
  (function buildEcgGrid() {
    const mat = new THREE.LineBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.28 });
    const boldMat = mat.clone();
    boldMat.opacity = 0.45;
    const spanX = TRACE_WIDTH + 8;
    const spanY = 14;
    const step = 0.55;
    const boldEvery = 5;

    for (let i = -Math.ceil(spanX / step); i <= Math.ceil(spanX / step); i++) {
      const x = i * step;
      const pts = [new THREE.Vector3(x, -spanY / 2, -1), new THREE.Vector3(x, spanY / 2, -1)];
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), i % boldEvery === 0 ? boldMat : mat));
    }
    for (let j = -Math.ceil(spanY / step); j <= Math.ceil(spanY / step); j++) {
      const y = j * step;
      const pts = [new THREE.Vector3(-spanX / 2, y, -1), new THREE.Vector3(spanX / 2, y, -1)];
      gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), j % boldEvery === 0 ? boldMat : mat));
    }
    gridGroup.position.y = -0.2;
    scene.add(gridGroup);
  })();

  function createMonitorTrace(opts) {
    const { y, z, opacity, amp, isPrimary } = opts;
    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);
    const ys = new Float32Array(POINT_COUNT);

    for (let i = 0; i < POINT_COUNT; i++) {
      const x = -TRACE_WIDTH / 2 + (i / (POINT_COUNT - 1)) * TRACE_WIDTH;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      ys[i] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity,
        blending: THREE.NormalBlending
      })
    );
    line.position.set(0, y, z);
    scene.add(line);
    return { line, geo, ys, y, z, amp, isPrimary };
  }

  const primary = createMonitorTrace({ y: 0.15, z: 0.5, opacity: 1, amp: 1.85, isPrimary: true });
  const secondary = createMonitorTrace({ y: -2.1, z: -0.3, opacity: 0.55, amp: 1.2, isPrimary: false });
  const traces = [primary, secondary];

  const sweep = new THREE.Mesh(
    new THREE.PlaneGeometry(0.04, 5.5),
    new THREE.MeshBasicMaterial({
      color: 0x047857,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  sweep.position.set(TRACE_WIDTH / 2, 0.15, 0.65);
  scene.add(sweep);

  const pen = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x047857, transparent: true, opacity: 1, blending: THREE.NormalBlending })
  );
  pen.position.set(TRACE_WIDTH / 2, 0.15, 0.75);
  scene.add(pen);

  const penGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.35, blending: THREE.NormalBlending, depthWrite: false })
  );
  penGlow.position.copy(pen.position);
  scene.add(penGlow);

  const cursorOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  cursorOrb.visible = false;
  scene.add(cursorOrb);

  const cursorHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.42, 48),
    new THREE.MeshBasicMaterial({ color: 0x1a6bff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false })
  );
  cursorHalo.rotation.x = -Math.PI / 2;
  cursorHalo.visible = false;
  scene.add(cursorHalo);

  const connectGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const connectLine = new THREE.Line(
    connectGeo,
    new THREE.LineBasicMaterial({ color: 0x047857, transparent: true, opacity: 0, blending: THREE.NormalBlending })
  );
  scene.add(connectLine);

  const PARTICLE_N = 72;
  const pPos = new Float32Array(PARTICLE_N * 3);
  const pBase = [];
  for (let i = 0; i < PARTICLE_N; i++) {
    const x = (Math.random() - 0.5) * TRACE_WIDTH * 1.1;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 4 - 1;
    pPos[i * 3] = x;
    pPos[i * 3 + 1] = y;
    pPos[i * 3 + 2] = z;
    pBase.push({ x, y, z, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5 });
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0x047857,
      size: 0.09,
      transparent: true,
      opacity: 0.6,
      blending: THREE.NormalBlending,
      depthWrite: false
    })
  );
  scene.add(particles);

  const ripplePool = Array.from({ length: 8 }, () => {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 56),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, life: 0 };
  });

  const trailPts = Array.from({ length: 6 }, () => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    m.visible = false;
    scene.add(m);
    return { mesh: m, life: 0, x: 0, y: 0, z: 0 };
  });

  let time = 0;
  let running = true;
  let scrollAccum = 0;
  let samplePhase = 0;
  let mouseNx = 0;
  let mouseNy = 0;
  let smoothNx = 0;
  let smoothNy = 0;
  let smoothWorldX = 0;
  let smoothWorldY = 0;
  let smoothWorldZ = 1.2;
  let beatBoost = 0;
  let hoverEnergy = 0;
  let mouseActive = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  const bpmEl = document.getElementById('heroBpm');
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();

  function colorForVertex(xNorm, fade, isPrimary) {
    const teal = new THREE.Color(0x047857);
    const blue = new THREE.Color(0x1d4ed8);
    const mix = THREE.MathUtils.clamp(0.5 + smoothNx * 0.35 + hoverEnergy * 0.15, 0, 1);
    const c = teal.clone().lerp(blue, mix);
    const b = isPrimary ? 0.3 + fade * (0.7 + hoverEnergy * 0.12) : 0.22 + fade * 0.5;
    return { r: c.r * b, g: c.g * b, bl: c.b * b };
  }

  function applyTraceColors(trace) {
    const col = trace.geo.attributes.color;
    for (let i = 0; i < POINT_COUNT; i++) {
      const x = trace.line.position.x + (-TRACE_WIDTH / 2 + (i / (POINT_COUNT - 1)) * TRACE_WIDTH);
      const xNorm = x / (TRACE_WIDTH / 2);
      const fade = Math.pow(i / (POINT_COUNT - 1), 1.55);
      const { r, g, bl } = colorForVertex(xNorm, fade, trace.isPrimary);
      col.setXYZ(i, r, g, bl);
    }
    col.needsUpdate = true;
  }

  function shiftTrace(trace, newY) {
    const mouseAmp = 1 + Math.abs(smoothNy) * 0.12 + hoverEnergy * 0.18;
    const amp = trace.amp * (1 + beatBoost * 0.35) * mouseAmp;
    for (let i = 0; i < POINT_COUNT - 1; i++) trace.ys[i] = trace.ys[i + 1];
    trace.ys[POINT_COUNT - 1] = newY * amp;

    const pos = trace.geo.attributes.position;
    const yLift = smoothNy * 0.35 * (trace.isPrimary ? 1 : 0.5);
    for (let i = 0; i < POINT_COUNT; i++) {
      const x = -TRACE_WIDTH / 2 + (i / (POINT_COUNT - 1)) * TRACE_WIDTH;
      const ripple = Math.sin(x * 0.35 + time * 1.2) * hoverEnergy * 0.04 * (i / POINT_COUNT);
      pos.setY(i, trace.ys[i] + yLift + ripple);
    }
    pos.needsUpdate = true;
    applyTraceColors(trace);
  }

  function scrollStep() {
    shiftTrace(primary, ecgSample(samplePhase));
    shiftTrace(secondary, ecgSample(samplePhase + 0.17) * 0.7);
    samplePhase += BEATS_PER_SEC / (POINT_COUNT / 3.8);
    if (samplePhase > 1e6) samplePhase %= 1000;

    const penY = primary.ys[POINT_COUNT - 1];
    pen.position.y = 0.15 + penY;
    penGlow.position.y = pen.position.y;
    sweep.position.y = 0.15;
    sweepLight.position.y = pen.position.y;
  }

  function pointerToWorld(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera({ x: nx, y: ny }, camera);
    raycaster.ray.intersectPlane(plane, hit);
    return hit.clone();
  }

  function spawnRipple(x, y) {
    beatBoost = 1;
    const slot = ripplePool.find((r) => r.life <= 0);
    if (slot) {
      slot.mesh.position.set(x, y, 0.8);
      slot.mesh.scale.setScalar(0.4);
      slot.mesh.material.opacity = 0.55;
      slot.mesh.visible = true;
      slot.life = 1;
    }
    penGlow.scale.setScalar(1.9);
    setTimeout(() => penGlow.scale.setScalar(1), 400);
  }

  function spawnTrail(x, y, z) {
    const slot = trailPts.find((t) => t.life <= 0);
    if (!slot) return;
    slot.x = x;
    slot.y = y;
    slot.z = z;
    slot.mesh.position.set(x, y, z);
    slot.mesh.material.opacity = 0.45;
    slot.mesh.visible = true;
    slot.life = 1;
  }

  function onPointerMove(e) {
    const rect = hero.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    mouseNx = (cx / rect.width - 0.5) * 2;
    mouseNy = (cy / rect.height - 0.5) * 2;
    mouseActive = true;
    hero.classList.add('hero--active');

    const dx = cx - lastMouseX;
    const dy = cy - lastMouseY;
    hoverEnergy = Math.min(1, hoverEnergy + Math.sqrt(dx * dx + dy * dy) * 0.004);
    lastMouseX = cx;
    lastMouseY = cy;

    const w = pointerToWorld(e.clientX, e.clientY);
    spawnTrail(w.x, w.y, w.z + 0.3);
  }

  function onPointerDown(e) {
    if (e.target.closest('button, a')) return;
    const w = pointerToWorld(e.clientX, e.clientY);
    spawnRipple(w.x, w.y);
    beatBoost = 1.2;
    hoverEnergy = Math.min(1, hoverEnergy + 0.35);
    hero.classList.add('hero--pulse');
    setTimeout(() => hero.classList.remove('hero--pulse'), 450);
  }

  function onPointerLeave() {
    mouseActive = false;
    hero.classList.remove('hero--active');
  }

  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  if (!prefersReduced) {
    hero.addEventListener('mousemove', onPointerMove);
    hero.addEventListener('mouseleave', onPointerLeave);
    hero.addEventListener('touchmove', (e) => {
      if (e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: true });
    hero.addEventListener('click', onPointerDown);
    hero.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el && el.closest('button, a')) return;
      onPointerDown({ clientX: touch.clientX, clientY: touch.clientY, target: el });
    });
  }

  const observer = new IntersectionObserver(
    (entries) => { running = entries[0].isIntersecting; },
    { threshold: 0.05 }
  );
  observer.observe(hero);

  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < POINT_COUNT; i++) {
    scrollStep();
    samplePhase += 0.02;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    const dt = prefersReduced ? 0.004 : 0.016;
    time += dt;

    smoothNx += (mouseNx - smoothNx) * 0.04;
    smoothNy += (mouseNy - smoothNy) * 0.04;
    hoverEnergy *= mouseActive ? 0.985 : 0.96;

    const targetWorld = pointerToWorld(
      hero.getBoundingClientRect().left + (smoothNx * 0.5 + 0.5) * hero.clientWidth,
      hero.getBoundingClientRect().top + (-smoothNy * 0.5 + 0.5) * hero.clientHeight
    );
    smoothWorldX += (targetWorld.x - smoothWorldX) * 0.07;
    smoothWorldY += (targetWorld.y - smoothWorldY) * 0.07;
    smoothWorldZ += (targetWorld.z + 1.4 - smoothWorldZ) * 0.07;

    scrollAccum += dt * (prefersReduced ? SCROLL_PPS * 0.35 : SCROLL_PPS);
    while (scrollAccum >= 1) {
      scrollAccum -= 1;
      scrollStep();
    }
    beatBoost *= 0.96;

    const peak = Math.max(0, ecgSample((time % (60 / BPM)) / (60 / BPM)));
    sweep.material.opacity = 0.38 + peak * 0.22 + beatBoost * 0.28 + hoverEnergy * 0.1;
    penGlow.material.opacity = 0.28 + peak * 0.4 + beatBoost * 0.45 + hoverEnergy * 0.15;
    pen.scale.setScalar(1 + peak * 0.35 + beatBoost * 0.25 + hoverEnergy * 0.08);

    camera.position.x = smoothNx * 1.4;
    camera.position.y = smoothNy * 0.75;
    camera.position.z = 15 - hoverEnergy * 0.6;
    camera.lookAt(smoothNx * 0.35, smoothNy * 0.25, 0);

    gridGroup.position.x = smoothNx * 0.5;
    gridGroup.position.y = -0.2 + smoothNy * 0.25;
    gridGroup.rotation.z = smoothNx * 0.012;

    mouseLight.position.set(smoothWorldX * 0.6, smoothWorldY * 0.5, 4 + hoverEnergy);
    mouseLight.intensity = 0.8 + hoverEnergy * 1.4 + beatBoost;
    sweepLight.intensity = 1.2 + peak * 1.5 + beatBoost * 1.8;

    if (mouseActive && !prefersReduced) {
      cursorOrb.visible = true;
      cursorHalo.visible = true;
      cursorOrb.position.set(smoothWorldX, smoothWorldY, smoothWorldZ);
      cursorHalo.position.set(smoothWorldX, smoothWorldY, smoothWorldZ - 0.05);
      const haloScale = 1 + hoverEnergy * 0.5 + beatBoost * 0.3;
      cursorHalo.scale.setScalar(haloScale);
      cursorOrb.material.opacity = 0.35 + hoverEnergy * 0.35;
      cursorHalo.material.opacity = 0.12 + hoverEnergy * 0.25;

      const dist = Math.hypot(pen.position.x - smoothWorldX, pen.position.y - smoothWorldY);
      const linkStrength = THREE.MathUtils.clamp(1 - dist / 18, 0, 1) * (0.35 + hoverEnergy * 0.45);
      connectLine.material.opacity = linkStrength;
      vA.set(smoothWorldX, smoothWorldY, smoothWorldZ);
      vB.copy(pen.position);
      connectGeo.setFromPoints([vA, vB]);
      connectGeo.attributes.position.needsUpdate = true;
    } else {
      cursorOrb.visible = false;
      cursorHalo.visible = false;
      connectLine.material.opacity *= 0.9;
    }

    const pAttr = particleGeo.attributes.position;
    for (let i = 0; i < PARTICLE_N; i++) {
      const b = pBase[i];
      const bx = b.x + Math.sin(time * b.speed + b.phase) * 0.35;
      const by = b.y + Math.cos(time * b.speed * 0.8 + b.phase) * 0.25;
      let px = bx + smoothNx * 0.8;
      let py = by + smoothNy * 0.5;
      let pz = b.z + Math.sin(time * 0.5 + b.phase) * 0.2;

      const dx = smoothWorldX - px;
      const dy = smoothWorldY - py;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const pull = mouseActive ? (0.018 + hoverEnergy * 0.03) / d : 0;
      px += dx * pull;
      py += dy * pull;

      pPos[i * 3] = px;
      pPos[i * 3 + 1] = py;
      pPos[i * 3 + 2] = pz;
    }
    pAttr.needsUpdate = true;
    particles.material.opacity = 0.5 + hoverEnergy * 0.35;

    ripplePool.forEach((r) => {
      if (r.life <= 0) return;
      r.life -= dt * 0.85;
      const s = 0.4 + (1 - r.life) * 16;
      r.mesh.scale.setScalar(s);
      r.mesh.material.opacity = r.life * 0.5;
      if (r.life <= 0) {
        r.mesh.visible = false;
        r.mesh.material.opacity = 0;
      }
    });

    trailPts.forEach((t, idx) => {
      if (t.life <= 0) return;
      t.life -= dt * (1.1 + idx * 0.08);
      t.mesh.material.opacity = t.life * 0.4;
      t.mesh.scale.setScalar(0.6 + (1 - t.life) * 0.5);
      if (t.life <= 0) t.mesh.visible = false;
    });

    if (bpmEl) {
      bpmEl.textContent = String(Math.round(BPM + Math.sin(time * 0.6) * 1.5 + beatBoost * 3 + hoverEnergy * 2));
    }

    renderer.render(scene, camera);
  }

  animate();
})();
