// The chemical store (data/reagents.json) with lookups. Molar mass and the
// display formula are computed by chem-core, never stored.
// Pure: no DOM, no browser APIs, so it runs unchanged in Node tests.
import data from '../data/reagents.json' with { type: 'json' };
import { molarMass, toDisplay } from '@chenjilabs/chem-core/formula';

const deepFreeze = (value) => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

/** GHS pictogram codes ("GHS05") with their name and meaning. */
export const GHS = deepFreeze(structuredClone(data.ghs));

/** Sources cited by the entries, keyed by id. */
export const SOURCES = deepFreeze(structuredClone(data.sources));

/**
 * Every reagent in the store, each with two computed fields:
 * formulaDisplay ("H₂SO₄") and molarMass (g/mol), both null for a mixture.
 */
export const REAGENTS = deepFreeze(
  data.reagents.map((r) => ({
    ...structuredClone(r),
    formulaDisplay: r.formula ? toDisplay(r.formula) : null,
    molarMass: r.formula ? molarMass(r.formula) : null,
  }))
);

const byId = new Map(REAGENTS.map((r) => [r.id, r]));

/** Looks up a reagent by id ("hcl"). Throws for an unknown id. */
export function reagent(id) {
  const r = byId.get(id);
  if (!r) throw new RangeError(`Unknown reagent: ${JSON.stringify(id)}`);
  return r;
}

/** True when the store has a reagent with this id. Used to validate app.json. */
export const hasReagent = (id) => byId.has(id);
