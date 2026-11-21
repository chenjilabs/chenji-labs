import '@chenjilabs/ui/tokens.css';
import '@chenjilabs/ui/ui.css';
import './style.css';
import { backLink, readout, scienceBox, selfCheck, slider, whatToTry } from '@chenjilabs/ui';
import { formatScientific } from '@chenjilabs/units';
import { SUBSTANCES, pH } from './chem.js';
import { colorAt, gradient } from './indicator.js';

const $ = (id) => document.getElementById(id);
const section = (name) => document.querySelector(`[data-section="${name}"]`);
const select = $('substance');

SUBSTANCES.forEach((s) => select.add(new Option(`${s.name} (${s.formula})`, s.id)));
select.value = 'hcl';
$('bar').style.background = gradient();

const conc = slider($('conc'), { format: (v) => formatScientific(10 ** v), onInput: update });
const phReading = readout($('ph'));

function update() {
  const s = SUBSTANCES.find((x) => x.id === select.value);
  const c = 10 ** conc.value;
  const value = pH(s, c);

  phReading.set(value.toFixed(2));
  $('liquid').style.fill = colorAt(value);
  $('pointer').style.left = `${(value / 14) * 100}%`;
  $('verdict').textContent = value < 6.5 ? 'Acidic' : value > 7.5 ? 'Basic' : 'Close to neutral';
  $('strength').textContent =
    s.strength === 'strong'
      ? `${s.name} is a strong ${s.kind}: it dissociates completely.`
      : `${s.name} is a weak ${s.kind}: it dissociates only partly.`;
}

select.addEventListener('change', update);
update();

backLink();
whatToTry(section('what-to-try'));
selfCheck(section('check-understanding'));
scienceBox(section('science'));
