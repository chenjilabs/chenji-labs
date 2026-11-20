import './style.css';
import { SUBSTANCES, pH } from './chem.js';
import { colorAt, gradient } from './indicator.js';

const $ = (id) => document.getElementById(id);
const select = $('substance');
const slider = $('conc');

SUBSTANCES.forEach((s) => select.add(new Option(`${s.name} (${s.formula})`, s.id)));
select.value = 'hcl';
$('bar').style.background = gradient();

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function format(c) {
  if (c >= 0.001) return String(Number(c.toPrecision(2)));
  const [m, e] = c.toExponential(1).split('e');
  return `${m} × 10${[...String(Number(e))].map((ch) => SUP[ch]).join('')}`;
}

function update() {
  const s = SUBSTANCES.find((x) => x.id === select.value);
  const c = 10 ** Number(slider.value);
  const value = pH(s, c);

  $('concText').textContent = format(c);
  $('ph').textContent = value.toFixed(2);
  $('liquid').style.fill = colorAt(value);
  $('pointer').style.left = `${(value / 14) * 100}%`;
  $('verdict').textContent = value < 6.5 ? 'Acidic' : value > 7.5 ? 'Basic' : 'Close to neutral';
  $('strength').textContent =
    s.strength === 'strong'
      ? `${s.name} is a strong ${s.kind}: it dissociates completely.`
      : `${s.name} is a weak ${s.kind}: it dissociates only partly.`;
}

select.addEventListener('change', update);
slider.addEventListener('input', update);
update();
