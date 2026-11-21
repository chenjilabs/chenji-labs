// Page wiring only. Keep every equation in science.js.
import '@chenjilabs/ui/tokens.css';
import '@chenjilabs/ui/ui.css';
import './style.css';
import { backLink, readout, scienceBox, selfCheck, slider, whatToTry } from '@chenjilabs/ui';
import { formatSig } from '@chenjilabs/units';
import { model } from './science.js';

const section = (name) => document.querySelector(`[data-section="${name}"]`);
const result = readout(document.getElementById('result'));

const update = (x) => result.set(formatSig(model(x), 3));
const x = slider(document.getElementById('x'), { format: (v) => formatSig(v, 2), onInput: update });
update(x.value);

backLink();
whatToTry(section('what-to-try'));
selfCheck(section('check-understanding'));
scienceBox(section('science'));
