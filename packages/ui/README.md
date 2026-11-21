# @chenjilabs/ui

The page shell and the "demonstrator" from the [lab model](../../docs/roadmap.md#the-lab-model): design tokens, shared styles and small DOM helpers. It has no framework and no dependencies.

**Progressive enhancement.** Every required section is written as static HTML in the experiment's `index.html` and marked with `data-section="<name>"`. These helpers enhance that markup; they never create a section from nothing. So the text reads fine without JavaScript, and CI can check that each section is present.

## Exports

| Export | Enhances | What it does |
| --- | --- | --- |
| `tokens.css` | | Palette and type scale (system fonts only) |
| `ui.css` | | Shared page, control, section and table styles |
| `slider(input, { format, onInput })` | `<input type="range">` | Shows the formatted value in `[data-value-for="<id>"]`, sets `aria-valuetext` |
| `readout(el)` | an `<output>` | Makes it a polite live region; returns `{ set(text) }` |
| `whatToTry(section)` | `[data-answer]` elements | Hides each answer behind "Show answer" |
| `selfCheck(section)` | `fieldset[data-question]` | Radio options, the right one marked `data-correct`, each with a `[data-why]` explanation; adds "Check answer" and announced feedback that says why each option is right or wrong |
| `scienceBox(section)` | `[data-part]` elements | Warns if `equation`, `assumptions`, `limits` or `sources` is missing |
| `backLink(a)` | `a[data-back]` | Points it at the landing page |
| `judge(options, i)`, `missingScienceParts(parts)` | | The pure logic behind the helpers (tested in Node) |

Feedback always says "Correct" or "Not quite" in words; colour only reinforces it.

## Example

```html
<section data-section="check-understanding">
  <h2>Check your understanding</h2>
  <fieldset data-question>
    <legend>You dilute pH 2 hydrochloric acid ten times. What is the new pH?</legend>
    <ul>
      <li><label><input type="radio" name="q1"> 1</label><p class="why" data-why>Diluting lowers [H⁺], so the pH goes up.</p></li>
      <li><label><input type="radio" name="q1" data-correct> 3</label><p class="why" data-why>[H⁺] falls tenfold, so the pH rises by 1.</p></li>
    </ul>
  </fieldset>
</section>
```

```js
import '@chenjilabs/ui/tokens.css';
import '@chenjilabs/ui/ui.css';
import { selfCheck } from '@chenjilabs/ui';

selfCheck(document.querySelector('[data-section="check-understanding"]'));
```
