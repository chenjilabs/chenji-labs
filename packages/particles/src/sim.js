// Pure particle-box simulation: no DOM, so it is tested in Node.
// Particles bounce elastically off the walls; they do not collide with each
// other. Speeds scale with √T and the box width scales with V. The drawing is
// illustrative only: pressure in an experiment comes from its science model.

/** Particle speed in px/s at REFERENCE_T. */
export const BASE_SPEED = 90;
export const REFERENCE_T = 300;
export const RADIUS = 4;
/** Simulation step in seconds, independent of the display's frame rate. */
export const FIXED_DT = 1 / 60;

/** Speed for a temperature in kelvin: proportional to √T. */
export function speedFor(T) {
  if (!(T > 0)) throw new RangeError(`Temperature must be positive, got ${T}`);
  return BASE_SPEED * Math.sqrt(T / REFERENCE_T);
}

/** Box width in px for a volume: proportional to V, up to maxWidth at maxVolume. */
export function widthFor(V, maxVolume, maxWidth) {
  if (!(V > 0) || !(maxVolume > 0)) throw new RangeError('Volumes must be positive');
  return Math.max(4 * RADIUS, (maxWidth * Math.min(V, maxVolume)) / maxVolume);
}

/** Small seeded random generator (mulberry32), so tests are repeatable. */
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spawn(state) {
  const angle = state.rand() * 2 * Math.PI;
  const speed = speedFor(state.T);
  return {
    x: RADIUS + state.rand() * (state.width - 2 * RADIUS),
    y: RADIUS + state.rand() * (state.height - 2 * RADIUS),
    vx: speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
  };
}

/** Creates a box of `count` particles at temperature T. */
export function createState({ count, width, height, T, seed = 1 }) {
  const state = { width, height, T, rand: random(seed), particles: [] };
  setCount(state, count);
  return state;
}

/** Moves every particle by dt seconds, reflecting elastically at the walls. */
export function step(state, dt) {
  const { width, height } = state;
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < RADIUS) { p.x = 2 * RADIUS - p.x; p.vx = Math.abs(p.vx); }
    if (p.x > width - RADIUS) { p.x = 2 * (width - RADIUS) - p.x; p.vx = -Math.abs(p.vx); }
    if (p.y < RADIUS) { p.y = 2 * RADIUS - p.y; p.vy = Math.abs(p.vy); }
    if (p.y > height - RADIUS) { p.y = 2 * (height - RADIUS) - p.y; p.vy = -Math.abs(p.vy); }
    // A very fast particle in a tiny box could overshoot twice; keep it inside.
    p.x = Math.min(Math.max(p.x, RADIUS), width - RADIUS);
    p.y = Math.min(Math.max(p.y, RADIUS), height - RADIUS);
  }
}

/**
 * Fixed-timestep driver: adds `elapsed` seconds of real time to the
 * accumulator, runs as many FIXED_DT steps as fit (at most maxSteps, so a
 * long pause doesn't freeze the page) and returns the time left over.
 */
export function advance(state, accumulator, elapsed, maxSteps = 8) {
  let acc = accumulator + Math.max(0, elapsed);
  let steps = 0;
  while (acc >= FIXED_DT && steps < maxSteps) {
    step(state, FIXED_DT);
    acc -= FIXED_DT;
    steps += 1;
  }
  return steps === maxSteps ? 0 : acc;
}

/** Changes temperature: every speed is scaled by √(T_new / T_old). */
export function setTemperature(state, T) {
  const factor = Math.sqrt(T / state.T) ;
  if (!(factor > 0)) throw new RangeError(`Temperature must be positive, got ${T}`);
  for (const p of state.particles) { p.vx *= factor; p.vy *= factor; }
  state.T = T;
}

/** Changes the box width (the moving wall), keeping every particle inside. */
export function setWidth(state, width) {
  state.width = width;
  for (const p of state.particles) p.x = Math.min(p.x, width - RADIUS);
}

/** Adds or removes particles to reach `count`. */
export function setCount(state, count) {
  const n = Math.max(0, Math.round(count));
  while (state.particles.length < n) state.particles.push(spawn(state));
  state.particles.length = n;
}

/** Root-mean-square speed of the particles, in px/s. */
export function rmsSpeed(state) {
  const { particles } = state;
  if (!particles.length) return 0;
  return Math.sqrt(particles.reduce((s, p) => s + p.vx ** 2 + p.vy ** 2, 0) / particles.length);
}

/**
 * Lets an action through at most once per `interval` ms. Returns
 * { ready(now) } where ready() is true when enough time has passed.
 */
export function throttle(interval) {
  let last = -Infinity;
  return {
    ready(now) {
      if (now - last < interval) return false;
      last = now;
      return true;
    },
  };
}
