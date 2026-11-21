# @chenji/chem-core

The laws of chemistry: pure, tested functions and the datasets they use. In the [lab model](../../docs/roadmap.md#the-lab-model) this is the part that knows the science. It never touches the page, so everything here runs unchanged in Node tests.

It depends only on `units` (once that package exists). Experiments and other packages import from it; it never imports from them.

## Datasets

### Elements: [`data/elements.json`](data/elements.json)

All 118 elements, one per line:

| Field | Meaning |
| --- | --- |
| `z` | Atomic number |
| `symbol`, `name` | IUPAC symbol and English name (aluminium, caesium, sulfur) |
| `mass` | Atomic weight as a number, equal to the molar mass in g/mol |
| `massLabel` | The same value as published, keeping trailing zeros: `"20.180"`, or `"[97]"` for a mass number |
| `massType` | `standard`: an IUPAC standard atomic weight. `mass-number`: the element has none, so `mass` is the mass number of its longest-lived known isotope |
| `group`, `period`, `block` | Position in the 18-column table. f-block elements have `group: null` |
| `sources` | Ids of the sources the entry was checked against (listed at the top of the file) |
| `review` | `needs-review` until a chemistry reviewer checks the entry, then `reviewed` |

Conventions:

- **Atomic weights** are the CIAAW abridged standard atomic weights. 84 elements have one: everything up to bismuth except technetium and promethium, plus thorium, protactinium and uranium.
- **Elements with no standard atomic weight** show the mass number of their longest-lived isotope in brackets, as most periodic tables do. These values can change as new isotopes are measured, so treat them as labels, not data to calculate with.
- **Group 3** follows IUPAC's 2021 recommendation: lutetium and lawrencium are in group 3, and La–Yb and Ac–No make up the f-block. Some school textbooks still put lanthanum and actinium in group 3. If our syllabus does, the periodic table experiment should explain the difference rather than change this data.

Use it from code:

```js
import { ELEMENTS, element, atomicWeight } from '@chenji/chem-core/elements';

element('Fe');           // { z: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, ... }
element(26).symbol;      // 'Fe'
2 * atomicWeight('H') + atomicWeight('O'); // 18.015 g/mol
```

## Formulas: [`src/formula.js`](src/formula.js)

```js
import { parseFormula, molarMass, toDisplay } from '@chenji/chem-core/formula';

parseFormula('Al2(SO4)3');  // Map { Al → 2, S → 3, O → 12 }
molarMass('CuSO4·5H2O');    // 249.677 g/mol (not rounded; round for display)
toDisplay('CuSO4.5H2O');    // 'CuSO₄·5H₂O'
```

The parser accepts element symbols, counts, nested `()` and `[]` groups, and hydrates joined with `·`, `.` or `*` (`CuSO4·5H2O`). It rejects unknown elements, zero counts, unbalanced brackets and charges (`Na+`) with a `SyntaxError` that gives the position of the problem.

## Changing a dataset

1. Edit the entry and cite the source you checked it against.
2. Set `review` back to `needs-review`.
3. Run `pnpm test`. The tests check every entry's shape, cross-check values with worked examples, and fail on anything inconsistent.
4. In the pull request, link the source and say what changed and why. A chemistry reviewer approves the change and marks the entry `reviewed`.
