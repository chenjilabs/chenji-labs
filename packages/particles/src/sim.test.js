import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_SPEED, FIXED_DT, RADIUS, REFERENCE_T, advance, createState, random, rmsSpeed,
  setCount, setTemperature, setWidth, speedFor, step, throttle, widthFor,
} from './sim.js';

const near = (actual, expected, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol, `expected ${expected}, got ${actual}`);
const box = (overrides = {}) => createState({ count: 20, width: 300, height: 200, T: 300, seed: 7, ...overrides });
const inside = (s) => s.particles.every((p) => p.x >= RADIUS && p.x <= s.width - RADIUS && p.y >= RADIUS && p.y <= s.height - RADIUS);

test('speed scales with √T: four times the temperature doubles the speed', () => {
  near(speedFor(REFERENCE_T), BASE_SPEED);
  near(speedFor(4 * REFERENCE_T) / speedFor(REFERENCE_T), 2);
  assert.throws(() => speedFor(0), RangeError);
});

test('box width scales with V', () => {
  near(widthFor(25, 50, 600), 300);
  near(widthFor(50, 50, 600), 600);
  near(widthFor(10, 50, 600) / widthFor(5, 50, 600), 2);
});

test('a particle hitting a wall bounces back with the same speed (elastic)', () => {
  const s = box({ count: 0 });
  s.particles.push({ x: 295, y: 100, vx: 60, vy: 0 });
  step(s, 0.1); // would reach x = 301, past the wall at 300 - RADIUS
  const [p] = s.particles;
  assert.ok(p.vx < 0, 'velocity reversed');
  near(Math.abs(p.vx), 60);
  near(p.x, 2 * (300 - RADIUS) - 301);
});

test('particles stay inside the box and keep their speed over many steps', () => {
  const s = box();
  const before = rmsSpeed(s);
  for (let i = 0; i < 2000; i++) step(s, FIXED_DT);
  assert.ok(inside(s));
  near(rmsSpeed(s), before, 1e-6);
});

test('raising the temperature scales every speed by √(T_new / T_old)', () => {
  const s = box();
  const before = rmsSpeed(s);
  setTemperature(s, 1200);
  near(rmsSpeed(s) / before, 2, 1e-9);
  assert.throws(() => setTemperature(s, 0), RangeError);
});

test('shrinking the box keeps every particle inside', () => {
  const s = box();
  setWidth(s, 40);
  assert.ok(s.particles.every((p) => p.x <= 40 - RADIUS));
});

test('fixed timestep: a frame of 3 steps runs exactly 3 steps', () => {
  const a = box();
  const b = box();
  const left = advance(a, 0, 3 * FIXED_DT + 0.001);
  for (let i = 0; i < 3; i++) step(b, FIXED_DT);
  assert.deepEqual(a.particles, b.particles);
  near(left, 0.001, 1e-9);
});

test('fixed timestep: results do not depend on the frame rate', () => {
  // Run two seconds at 30 fps and at 144 fps. Each run must end exactly where
  // the same number of fixed steps would put it, and the two runs may differ
  // by at most one step (time still waiting in the accumulator).
  const run = (fps) => {
    const s = box();
    let acc = 0;
    for (let i = 0; i < 2 * fps; i++) acc = advance(s, acc, 1 / fps);
    return { s, steps: Math.round((2 - acc) / FIXED_DT) };
  };
  const reference = (steps) => {
    const s = box();
    for (let i = 0; i < steps; i++) step(s, FIXED_DT);
    return s;
  };
  const slow = run(30);
  const fast = run(144);
  assert.ok(Math.abs(slow.steps - fast.steps) <= 1, `${slow.steps} vs ${fast.steps} steps`);
  for (const { s, steps } of [slow, fast]) {
    const ref = reference(steps);
    s.particles.forEach((p, i) => { near(p.x, ref.particles[i].x, 1e-9); near(p.y, ref.particles[i].y, 1e-9); });
  }
});

test('a long pause does not run a burst of catch-up steps', () => {
  const s = box();
  assert.equal(advance(s, 0, 10), 0);
});

test('the particle count can grow and shrink', () => {
  const s = box();
  setCount(s, 35);
  assert.equal(s.particles.length, 35);
  setCount(s, 5);
  assert.equal(s.particles.length, 5);
});

test('the seeded generator is repeatable', () => {
  const a = random(42);
  const b = random(42);
  for (let i = 0; i < 5; i++) assert.equal(a(), b());
});

test('throttle lets a label update through at most once per second', () => {
  const gate = throttle(1000);
  assert.equal(gate.ready(0), true);
  assert.equal(gate.ready(400), false);
  assert.equal(gate.ready(999), false);
  assert.equal(gate.ready(1000), true);
  assert.equal(gate.ready(1500), false);
});
