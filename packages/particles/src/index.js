// A 2D canvas particle box for concept explorers. The simulation is in sim.js
// (pure, tested); this file only animates and draws it.
import {
  FIXED_DT, RADIUS, advance, createState, setCount, setTemperature, setWidth, throttle, widthFor,
} from './sim.js';

export * from './sim.js';

const LABEL_INTERVAL_MS = 1000;

/**
 * Starts a particle box on an existing <canvas>.
 * @param {HTMLCanvasElement} canvas drawn in its own width/height coordinates
 * @param {object} options
 * @param {number} options.temperature kelvin
 * @param {number} options.volume current volume
 * @param {number} options.maxVolume volume that fills the canvas width
 * @param {number} options.count number of particles
 * @param {(v: { temperature: number, volume: number, count: number }) => string} options.describe
 *   text for the canvas aria-label, e.g. "Particles moving fast in a narrow box: 300 K, 10 L"
 * @param {HTMLButtonElement} [options.pauseButton] toggles the animation
 */
export function createParticleBox(canvas, { temperature, volume, maxVolume, count, describe, pauseButton }) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const values = { temperature, volume, count };
  const state = createState({ count, width: widthFor(volume, maxVolume, W), height: H, T: temperature });
  const labelGate = throttle(LABEL_INTERVAL_MS);
  const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let userPaused = reduceMotion; // start paused when the learner prefers reduced motion
  let frame = 0;
  let lastTime = 0;
  let acc = 0;
  let labelTimer = 0;

  canvas.setAttribute('role', 'img');

  const style = getComputedStyle(canvas);
  const ink = style.getPropertyValue('--ink').trim() || '#16232d';
  const shade = style.getPropertyValue('--line').trim() || '#b9c5cb';

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = shade; // the space beyond the moving wall
    ctx.fillRect(state.width, 0, W - state.width, H);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, state.width - 3, H - 3);
    ctx.fillStyle = ink;
    for (const p of state.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  function updateLabel() {
    clearTimeout(labelTimer);
    const now = performance.now();
    if (labelGate.ready(now)) canvas.setAttribute('aria-label', describe(values));
    else labelTimer = setTimeout(updateLabel, LABEL_INTERVAL_MS);
  }

  function tick(time) {
    const elapsed = lastTime ? (time - lastTime) / 1000 : FIXED_DT;
    lastTime = time;
    acc = advance(state, acc, elapsed);
    draw();
    frame = requestAnimationFrame(tick);
  }

  const running = () => frame !== 0;
  function start() {
    if (running() || userPaused || document.hidden) return;
    lastTime = 0;
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function syncButton() {
    if (!pauseButton) return;
    pauseButton.textContent = userPaused ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(userPaused));
  }

  const onVisibility = () => (document.hidden ? stop() : start()); // save battery in hidden tabs
  document.addEventListener('visibilitychange', onVisibility);
  const onPause = () => (userPaused ? api.play() : api.pause());
  pauseButton?.addEventListener('click', onPause);

  const api = {
    /** Updates temperature, volume and/or particle count. */
    update(next) {
      Object.assign(values, next);
      if (next.temperature !== undefined) setTemperature(state, next.temperature);
      if (next.volume !== undefined) setWidth(state, widthFor(next.volume, maxVolume, W));
      if (next.count !== undefined) setCount(state, next.count);
      updateLabel();
      if (!running()) draw();
    },
    pause() { userPaused = true; stop(); syncButton(); },
    play() { userPaused = false; syncButton(); start(); },
    get paused() { return userPaused; },
    destroy() {
      stop();
      clearTimeout(labelTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      pauseButton?.removeEventListener('click', onPause);
    },
  };

  canvas.setAttribute('aria-label', describe(values));
  syncButton();
  draw();
  start();
  return api;
}
