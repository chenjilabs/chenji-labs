// Lab notebook: a small results table, kept apart from the page code so the
// Phase 2 bench can take it over. Pure: no DOM.
import { formatSig } from '@chenjilabs/units';

export const MAX_ROWS = 8;
export const SIG_FIGS = 4;

/** Table columns, with units in the headers. */
export const COLUMNS = [
  { key: 'P', label: 'P / kPa' },
  { key: 'V', label: 'V / L' },
  { key: 'T', label: 'T / K' },
  { key: 'PV', label: 'PV / kPa·L' },
  { key: 'VT', label: '(V/T) / L·K⁻¹' },
];

/** Turns a gas state into a notebook row, with the derived columns PV and V/T. */
export const toRow = ({ P, V, T }) => ({ P, V, T, PV: P * V, VT: V / T });

/** Formats every value in a row to SIG_FIGS significant figures. */
export const formatRow = (row) => COLUMNS.map(({ key }) => formatSig(row[key], SIG_FIGS));

/** Creates an empty notebook holding at most `max` rows. */
export function createNotebook(max = MAX_ROWS) {
  let rows = [];
  return {
    get rows() { return rows.slice(); },
    get full() { return rows.length >= max; },
    /** Records a reading. Returns { ok, message } so the page can announce it. */
    record(state) {
      if (rows.length >= max) {
        return { ok: false, message: `The table is full (${max} readings). Clear it to record more.` };
      }
      rows = [...rows, toRow(state)];
      return { ok: true, message: `Reading ${rows.length} of ${max} recorded.` };
    },
    clear() {
      rows = [];
      return { ok: true, message: 'Table cleared.' };
    },
  };
}
