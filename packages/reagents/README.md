# @chenjilabs/reagents

The chemical store from the [lab model](../../docs/roadmap.md#the-lab-model): one entry per bottle on the shelf. Instruments and the bench read substances from here; experiments list the reagent ids they use in `app.json`, and the build will reject an id that isn't in the store.

It depends only on `chem-core` (and `units` once that exists). It is pure, with no page code, so everything here runs in Node tests.

## The data: [`data/reagents.json`](data/reagents.json)

| Field | Meaning |
| --- | --- |
| `id` | Short kebab-case id used in `app.json`, such as `hcl` or `nh3-aq` |
| `name`, `otherNames` | Name as the syllabus uses it (ethanoic acid), plus common alternatives (acetic acid) |
| `formula` | Plain-text formula, such as `H2SO4`. `null` only for a mixture (`"mixture": true`) |
| `state` | `aqueous`, `solid`, `liquid` or `gas`: the form used at the bench |
| `appearance` | What it looks like, **in words**, so no result depends on colour alone |
| `displayColour` | Approximate colour for drawing, or `null` if colourless |
| `acidBase` | `role` (acid or base), `strength` (strong or weak), and `pKa` values of the acid form at 25 °C. `null` in `pKa` marks a step that is complete in water. A base's `conjugateAcid` says whose pKa it is |
| `indicator` | For indicators: a `scale` of colours at rising pH, each named in words |
| `hazards` | GHS pictograms (`GHS01` to `GHS09`) for the form named in `appliesTo` |
| `sources`, `review` | Where each entry was checked, and whether a chemistry reviewer has approved it |

**Computed, never stored:** `molarMass` (g/mol) and `formulaDisplay` (`H₂SO₄`) come from `chem-core`, so they always match the elements data.

**Hazards depend on concentration.** The pictograms describe the substance as supplied: concentrated acid, solid pellets or glacial acid. The dilute solutions used in most practicals often carry fewer pictograms or none. This is teaching data, not a safety data sheet. In a real lab, follow the supplier's SDS.

## Use it from code

```js
import { REAGENTS, reagent, hasReagent, GHS } from '@chenjilabs/reagents';

reagent('h2so4').formulaDisplay;           // 'H₂SO₄'
reagent('h2so4').molarMass;                // 98.072 (g/mol)
reagent('ch3cooh').acidBase.pKa;           // [4.76]
reagent('phenolphthalein').indicator.scale; // colourless at pH 8.2 → pink at pH 10.0
reagent('hcl').hazards.ghs.map((c) => GHS[c].name); // ['Corrosion', 'Exclamation mark']
```

## Adding a reagent

A reagent joins the store when an experiment needs it, following the roadmap's rule for adding to shared packages.

1. Add an entry with an `id`, the fields above, and at least one source. Set `review` to `needs-review`.
2. For hazards, name the form in `appliesTo` and take the pictograms from the ECHA C&L Inventory or the supplier's SDS.
3. Run `pnpm test`. The tests check every field and compute the molar mass, which also checks that the formula is valid.
4. In the pull request, link your sources. A chemistry reviewer approves the entry and marks it `reviewed`.
