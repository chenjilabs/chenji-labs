// Page wiring only: the science is in gas-laws.js and the table in notebook.js.
import '@chenjilabs/ui/tokens.css';
import '@chenjilabs/ui/ui.css';
import './style.css';
import { backLink, readout, scienceBox, selfCheck, slider, whatToTry } from '@chenjilabs/ui';
import { formatSig } from '@chenjilabs/units';
import { createParticleBox } from '@chenjilabs/particles';
import { MODES, RANGES, applyChange, initialState } from './gas-laws.js';
import { COLUMNS, createNotebook, formatRow } from './notebook.js';

const $ = (id) => document.getElementById(id);
const section = (name) => document.querySelector(`[data-section="${name}"]`);

let mode = 'boyle';
let state = initialState({ n: 1, T: 300, V: 25 });

// --- Controls ---------------------------------------------------------------

const sliders = {};
for (const key of ['T', 'V', 'n']) {
  const input = $(key);
  Object.assign(input, { min: RANGES[key].min, max: RANGES[key].max, step: RANGES[key].step, value: state[key] });
  sliders[key] = slider(input, { format: (v) => formatSig(v, 3), onInput: (v) => change({ [key]: v }) });
}
const pressureReadout = readout($('P'));
const limitNote = $('limit');

// The particle count suggests the amount of gas: about 40 particles per mole.
const particlesFor = (n) => Math.round(n * 40);
const speedWord = (T) => (T < 250 ? 'slowly' : T < 450 ? 'at a moderate speed' : 'fast');
const boxWord = (V) => (V < RANGES.V.max / 3 ? 'a narrow' : V < (2 * RANGES.V.max) / 3 ? 'a medium' : 'a wide');
const box = createParticleBox($('box'), {
  temperature: state.T,
  volume: state.V,
  maxVolume: RANGES.V.max,
  count: particlesFor(state.n),
  describe: ({ temperature, volume }) =>
    `Particles moving ${speedWord(temperature)} in ${boxWord(volume)} box: ${formatSig(temperature, 3)} K, ${formatSig(volume, 3)} L`,
  pauseButton: $('pause'),
});

function render() {
  const m = MODES[mode];
  pressureReadout.set(formatSig(state.P, 4));
  for (const key of ['T', 'V', 'n']) {
    sliders[key].value = state[key]; // a computed volume moves its slider too...
    sliders[key].show(state[key]); // ...but the label shows the exact value, not one snapped to the step
    sliders[key].disabled = !m.inputs.includes(key);
  }
  // Mark the held-constant and computed quantities in words, not only by greying out.
  for (const key of ['P', 'T', 'V', 'n']) {
    const tag = document.querySelector(`[data-tag-for="${key}"]`);
    tag.textContent = key === m.locked ? 'held constant' : key === m.computed ? 'computed (read-only)' : '';
    tag.hidden = !tag.textContent;
  }
  box.update({ temperature: state.T, volume: state.V, count: particlesFor(state.n) });
}

function change(changes) {
  const result = applyChange(mode, state, changes);
  state = result.state;
  limitNote.textContent = result.limited
    ? `That would need a volume of ${formatSig(result.limited.value, 3)} L, outside the ${result.limited.min}–${result.limited.max} L range.`
    : '';
  render();
}

for (const radio of document.querySelectorAll('input[name="mode"]')) {
  radio.addEventListener('change', () => {
    mode = radio.value;
    change({});
  });
}

// --- Notebook ---------------------------------------------------------------

const notebook = createNotebook();
const status = $('notebook-status');
$('notebook-head').innerHTML = COLUMNS.map((c) => `<th scope="col">${c.label}</th>`).join('');

function renderTable() {
  $('notebook-body').innerHTML = notebook.rows
    .map((row) => `<tr>${formatRow(row).map((v) => `<td>${v}</td>`).join('')}</tr>`)
    .join('');
  $('record').disabled = notebook.full;
}

$('record').addEventListener('click', () => {
  status.textContent = notebook.record(state).message;
  renderTable();
});
$('clear').addEventListener('click', () => {
  status.textContent = notebook.clear().message;
  renderTable();
});

render();
renderTable();
backLink();
whatToTry(section('what-to-try'));
selfCheck(section('check-understanding'));
scienceBox(section('science'));
