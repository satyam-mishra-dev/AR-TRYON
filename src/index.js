import * as deepar from 'deepar';

/** Effect file names must exist under `/effects/` (see `public/effects/`). */
const PRODUCTS = [
  {
    effect: 'Arch_Slippers_Black.deepar',
    name: 'Arch Slippers Black',
    thumb: 'gray.png',
  },
  {
    effect: 'Arch_Slippers_Green.deepar',
    name: 'Arch Slippers Green',
    thumb: 'medium.png',
  },
  {
    effect: 'nike-dunk.deepar',
    name: 'Nike Dunk Low Laser Orange',
    thumb:
      'https://res.cloudinary.com/do3n0jjlv/image/upload/v1702649317/Shoes/403398657_384538924011762_4284071920092880444_n_ciszhk.jpg',
  },
  {
    effect: 'nike-airforce1.deepar',
    name: 'Nike Air Force 1 Orange Streak',
    thumb:
      'https://lzd-img-global.slatic.net/g/p/b9655aae270f527efed0ec9ae9345e8d.jpg_720x720q80.jpg_.webp',
  },
  {
    effect: 'on-run-cloudmonster.deepar',
    name: "On Cloudmonster Running",
    thumb:
      'https://media.finishline.com/i/finishline/6198283_680_P1?$default$&w=671&&h=671&bg=rgb(237,237,237)',
  },
  {
    effect: 'puma-voltaire.deepar',
    name: 'Puma Voltaire OG',
    thumb:
      'https://a3.cdn.hhv.de/items/images/generated/475x475/00960/960187/1-puma-voltaire-og-pristine-dusty-tan.webp',
  },
  {
    effect: 'new-balance-574.deepar',
    name: 'New Balance 574 Navy',
    thumb:
      'https://sneakerholicvietnam.vn/wp-content/uploads/2022/07/new-balance-574-navy-ml574en-768x768.jpg',
  },
  {
    effect: 'Shoe_PBR',
    name: 'Nike Air Max 270 Light Bone',
    thumb:
      'https://imagedelivery.net/2DfovxNet9Syc-4xYpcsGg/1edf71c9-0f83-4120-31de-38faf7e8b900/product',
  },
];

const LICENSE_KEY = process.env.DEEPAR_LICENSE_KEY;

const THUMB_PX = 60;

function resizeCanvas(canvas) {
  const scale = window.devicePixelRatio || 1;
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);
  canvas.width = Math.floor(w * scale);
  canvas.height = Math.floor(h * scale);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function angleDiff(a, b) {
  const d = ((a - b + Math.PI) % (2 * Math.PI)) - Math.PI;
  return Math.abs(d);
}

function layoutWheel(scroller, inner) {
  const thumbs = inner.querySelectorAll('.product-thumb');
  const n = thumbs.length;
  if (!n) return;

  const cw = scroller.clientWidth || window.innerWidth;
  const R = clamp(160, 320, cw * 0.45);
  const maxGapPx = 76;
  const maxSpanDeg = 140;
  const gapRad = maxGapPx / R;
  const maxSpanRad = (maxSpanDeg * Math.PI) / 180;
  const span = n === 1 ? 0 : Math.min(maxSpanRad, gapRad * (n - 1));
  const start = -Math.PI / 2 - span / 2;
  const step = n === 1 ? 0 : span / (n - 1);

  const innerW = Math.max(cw, Math.ceil(2 * R + THUMB_PX * 2));
  const cx = innerW / 2 - 40;
  const cy = R + THUMB_PX * 1.1;
  const visibleH = Math.round(R * 0.6 + THUMB_PX * 1.3);

  inner.style.width = `${innerW}px`;
  inner.style.height = `${Math.ceil(2 * R + THUMB_PX)}px`;
  scroller.style.height = `${visibleH}px`;
  scroller.style.setProperty('--rim-x', `${cx}px`);
  scroller.style.setProperty('--rim-y', `${cy - R + 2}px`);
  scroller.style.setProperty('--rim-size', `${THUMB_PX + 6}px`);

  const baseAngles = [];
  for (let i = 0; i < n; i++) {
    const theta = start + step * i;
    baseAngles.push(theta);
    const x = cx + R * Math.cos(theta) - THUMB_PX / 2;
    const y = cy + R * Math.sin(theta) - THUMB_PX / 2;
    const el = thumbs[i];
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    el.dataset.theta = `${theta}`;
  }

  inner.__wheel = { cx, cy, R, baseAngles };
}

function applyWheelRotation(scroller, inner, angle, onActiveIndex) {
  const wheel = inner.__wheel;
  if (!wheel) return;
  const { cx, cy, R, baseAngles } = wheel;
  const target = -Math.PI / 2;
  let active = 0;
  let best = Infinity;

  inner.querySelectorAll('.product-thumb').forEach((el, i) => {
    const theta = baseAngles[i] + angle;
    const x = cx + R * Math.cos(theta) - THUMB_PX / 2;
    const y = cy + R * Math.sin(theta) - THUMB_PX / 2;
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    const dist = angleDiff(theta, target);
    if (dist < best) {
      best = dist;
      active = i;
    }
  });

  if (inner.__activeIndex !== active) {
    inner.__activeIndex = active;
    if (navigator.vibrate) navigator.vibrate(8);
    onActiveIndex?.(active);
  }

  inner.querySelectorAll('.product-thumb').forEach((el, i) => {
    el.classList.toggle('is-active', i === active);
  });
}

function getNearestIndex(inner, angle) {
  const wheel = inner.__wheel;
  if (!wheel) return 0;
  const target = -Math.PI / 2;
  let active = 0;
  let best = Infinity;
  wheel.baseAngles.forEach((base, i) => {
    const dist = angleDiff(base + angle, target);
    if (dist < best) {
      best = dist;
      active = i;
    }
  });
  return active;
}

function snapAngleForIndex(inner, index) {
  const wheel = inner.__wheel;
  if (!wheel) return 0;
  const target = -Math.PI / 2;
  return target - wheel.baseAngles[index];
}

function animateAngle(from, to, onStep, onDone) {
  const start = performance.now();
  const duration = 180;
  const tick = (t) => {
    const p = Math.min(1, (t - start) / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    const v = from + (to - from) * ease;
    onStep(v);
    if (p < 1) requestAnimationFrame(tick);
    else onDone?.();
  };
  requestAnimationFrame(tick);
}

function renderThumbnails(scroller, inner, onSelect, onActiveIndex, onSettle) {
  inner.replaceChildren();
  PRODUCTS.forEach((p, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'product-thumb';
    btn.setAttribute('aria-label', p.name);
    btn.dataset.index = String(index);
    const img = document.createElement('img');
    img.src = p.thumb;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    btn.appendChild(img);
    btn.addEventListener('click', () => onSelect(index));
    inner.appendChild(btn);
  });

  inner.__activeIndex = 0;
  inner.__angle = 0;
  const relayout = () => {
    layoutWheel(scroller, inner);
    inner.__angle = snapAngleForIndex(inner, inner.__activeIndex || 0);
    applyWheelRotation(scroller, inner, inner.__angle, onActiveIndex);
  };
  relayout();
  window.addEventListener('resize', relayout);
  let dragging = false;
  let startX = 0;
  let startAngle = 0;
  let animating = false;
  scroller.addEventListener('pointerdown', (e) => {
    dragging = true;
    startX = e.clientX;
    startAngle = inner.__angle || 0;
    scroller.setPointerCapture(e.pointerId);
  });
  scroller.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const wheel = inner.__wheel;
    if (!wheel) return;
    const dx = e.clientX - startX;
    const angleDelta = dx / wheel.R;
    inner.__angle = startAngle + angleDelta;
    if (!animating) applyWheelRotation(scroller, inner, inner.__angle, onActiveIndex);
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    scroller.releasePointerCapture(e.pointerId);
    const nearest = getNearestIndex(inner, inner.__angle || 0);
    const snap = snapAngleForIndex(inner, nearest);
    const from = inner.__angle || 0;
    animating = true;
    animateAngle(from, snap, (val) => {
      inner.__angle = val;
      applyWheelRotation(scroller, inner, inner.__angle, onActiveIndex);
    }, () => {
      animating = false;
      onSettle?.(nearest);
    });
  };
  scroller.addEventListener('pointerup', endDrag);
  scroller.addEventListener('pointercancel', endDrag);
  const ro = new ResizeObserver(relayout);
  ro.observe(scroller);
}

function setActiveThumb(inner, index) {
  inner.querySelectorAll('.product-thumb').forEach((el, i) => {
    el.classList.toggle('is-active', i === index);
  });
}

function scrollThumbIntoView(inner, index) {
  const btn = inner.querySelector(`[data-index="${index}"]`);
  btn?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
}

async function main() {
  const canvas = document.getElementById('deepar-canvas');
  const loader = document.getElementById('loader-wrapper');
  const feetHint = document.getElementById('feet-hint');
  const startCameraBtn = document.getElementById('start-camera');
  const productName = document.getElementById('product-name');
  const thumbScroller = document.getElementById('thumb-scroller');
  const thumbArcInner = document.getElementById('thumb-arc-inner');
  const logPanel = document.getElementById('log-panel');
  const logLines = document.getElementById('log-lines');

  resizeCanvas(canvas);
  window.addEventListener('resize', () => resizeCanvas(canvas));

  const first = PRODUCTS[0];
  productName.textContent = first.name;

  let deepAR;
  let currentIndex = 0;
  const log = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    if (logLines) {
      const div = document.createElement('div');
      div.textContent = line;
      logLines.appendChild(div);
      logPanel.hidden = false;
      logPanel.scrollTop = logPanel.scrollHeight;
    }
  };
  window.addEventListener('error', (e) => log(`window.error: ${e.message}`));
  window.addEventListener('unhandledrejection', (e) =>
    log(`unhandledrejection: ${e.reason}`),
  );
  log(`UserAgent: ${navigator.userAgent}`);
  log(`Protocol: ${location.protocol}`);
  log(`Host: ${location.host}`);
  log(`DeepAR license present: ${Boolean(LICENSE_KEY)}`);
  log(`SecureContext: ${window.isSecureContext}`);
  log(`MediaDevices: ${Boolean(navigator.mediaDevices)}`);
  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const cams = devices.filter((d) => d.kind === 'videoinput').length;
        log(`enumerateDevices ok: ${devices.length} devices, ${cams} cameras`);
      })
      .catch((e) => log(`enumerateDevices failed: ${e?.message || e}`));
  }
  const checkResource = async (path) => {
    try {
      const res = await fetch(path, { method: 'GET' });
      log(`Resource ${path} -> ${res.status}`);
    } catch (e) {
      log(`Resource ${path} failed: ${e?.message || e}`);
    }
  };
  checkResource('/deepar-resources/js/deepar.js');
  checkResource('/deepar-resources/file_sizes.json');

  const selectProduct = async (index) => {
    if (!deepAR || index === currentIndex || index < 0 || index >= PRODUCTS.length) return;
    currentIndex = index;
    const p = PRODUCTS[index];
    productName.textContent = p.name;
    setActiveThumb(thumbArcInner, index);
    try {
      log(`switchEffect: ${p.effect}`);
      await deepAR.switchEffect(`effects/${p.effect}`);
      log(`switchEffect ok: ${p.effect}`);
    } catch (e) {
      console.error('switchEffect failed', p.effect, e);
      log(`switchEffect failed: ${p.effect} | ${e?.message || e}`);
    }
  };

  let settleTimer;
  const onActiveIndex = (index) => {
    if (index >= 0) {
      setActiveThumb(thumbArcInner, index);
    }
  };
  const onSettle = (index) => {
    if (index < 0) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => selectProduct(index), 120);
  };
  renderThumbnails(thumbScroller, thumbArcInner, selectProduct, onActiveIndex, onSettle);
  setActiveThumb(thumbArcInner, 0);

  let started = false;
  const startDeepAR = async () => {
    try {
      if (started) return;
      started = true;
      log('Starting DeepAR initialize...');
      log('Requesting getUserMedia (preflight)...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        log('getUserMedia success');
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        log(`getUserMedia failed: ${e?.name || ''} ${e?.message || e}`);
      }
      deepAR = await deepar.initialize({
        licenseKey: LICENSE_KEY,
        canvas,
        effect: `effects/${first.effect}`,
        additionalOptions: {
          cameraConfig: { facingMode: 'environment' },
          hint: 'footInit',
        },
      });

      loader.style.display = 'none';
      startCameraBtn?.setAttribute('hidden', 'true');
      log('DeepAR initialized successfully');
      if (thumbArcInner.__activeIndex >= 0) {
        selectProduct(thumbArcInner.__activeIndex);
      }

      deepAR.callbacks.onFeetTracked = (leftFoot, rightFoot) => {
        if (leftFoot.detected || rightFoot.detected) {
          feetHint.hidden = true;
          deepAR.callbacks.onFeetTracked = undefined;
          log('Feet tracked');
        }
      };
    } catch (e) {
      console.error(e);
      loader.style.display = 'none';
      document.body.classList.add('no-camera');
      log(`DeepAR init failed: ${e?.message || e}`);
    }
  };

  loader.style.display = 'none';
  startCameraBtn?.removeAttribute('hidden');
  log('Start Camera button shown');
  const triggerStart = (source) => {
    log(`Start Camera triggered by ${source}`);
    loader.style.display = 'flex';
    startDeepAR();
  };
  startCameraBtn?.addEventListener('click', () => triggerStart('button'));
  const autoStartOnce = () => {
    document.removeEventListener('touchend', autoStartOnce);
    document.removeEventListener('mousedown', autoStartOnce);
    triggerStart('first-gesture');
  };
  document.addEventListener('touchend', autoStartOnce, { passive: true });
  document.addEventListener('mousedown', autoStartOnce);
}

main().catch((err) => {
  console.error(err);
  const loader = document.getElementById('loader-wrapper');
  if (loader) {
    loader.innerHTML =
      '<p class="load-error">Could not start AR. Check camera permission and that effect files exist in <code>effects/</code>.</p>';
  }
});
