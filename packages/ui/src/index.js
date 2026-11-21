// Page helpers for every experiment. Framework-free and progressive: each
// helper enhances static HTML that is already on the page (marked with
// data-section and data-* hooks); none of them builds a section from nothing,
// so the text stays readable without JavaScript.
//
// The decisions (what counts as correct, which parts are missing) live in the
// pure functions at the top, which are tested in Node. The DOM wrappers below
// them only read the page and apply those decisions.

// --- Pure logic -------------------------------------------------------------

/** The parts every "Science behind this" section needs, in order. */
export const SCIENCE_PARTS = ['equation', 'assumptions', 'limits', 'sources'];

/** Which required science parts are missing from the ones present. */
export const missingScienceParts = (present) => SCIENCE_PARTS.filter((p) => !present.includes(p));

/**
 * Judges a multiple-choice answer.
 * @param {{ correct: boolean, why: string }[]} options
 * @param {number} selected index of the chosen option, or -1 for none
 * @returns {{ status: 'none' | 'correct' | 'incorrect', message: string }}
 */
export function judge(options, selected) {
  if (!options.some((o) => o.correct)) throw new Error('A question needs at least one correct option');
  if (selected < 0 || selected >= options.length) return { status: 'none', message: 'Choose an answer first.' };
  const { correct, why } = options[selected];
  return { status: correct ? 'correct' : 'incorrect', message: `${correct ? '✓ Correct.' : '✗ Not quite.'} ${why}`.trim() };
}

// --- DOM helpers ------------------------------------------------------------

/**
 * Enhances a range input: shows its formatted value in the element marked
 * data-value-for="<input id>", sets aria-valuetext, and calls onInput.
 * @param {HTMLInputElement} input
 * @param {{ format?: (v: number) => string, onInput?: (v: number) => void }} [options]
 */
export function slider(input, { format = String, onInput } = {}) {
  const display = document.querySelector(`[data-value-for="${input.id}"]`);
  const show = (v) => {
    const text = format(v);
    if (display) display.textContent = text;
    input.setAttribute('aria-valuetext', text);
  };
  const refresh = () => show(Number(input.value));
  input.addEventListener('input', () => {
    refresh();
    onInput?.(Number(input.value));
  });
  refresh();
  return {
    get value() { return Number(input.value); },
    set value(v) { input.value = String(v); refresh(); },
    refresh,
    /** Shows an exact value (e.g. a computed one) that the slider's step would round. */
    show,
    set disabled(d) { input.disabled = d; },
  };
}

/**
 * Makes an element a polite live readout and returns a setter.
 * @param {HTMLElement} el
 */
export function readout(el) {
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  return { set: (text) => { el.textContent = text; } };
}

/**
 * "What to try": hides each answer (an element marked data-answer) behind a
 * "Show answer" disclosure. Without JavaScript the answers simply stay visible.
 * @param {HTMLElement} section
 */
export function whatToTry(section) {
  const answers = [...section.querySelectorAll('[data-answer]')].filter((a) => !a.closest('details'));
  for (const answer of answers) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Show answer';
    answer.replaceWith(details);
    details.append(summary, answer);
  }
  return answers.length;
}

/**
 * "Check your understanding": each <fieldset data-question> holds radio
 * options; the correct one has data-correct, and each option's explanation is
 * an element with data-why in the same list item. Without JavaScript the
 * explanations are visible, like a worked answer. With it, they are hidden
 * until the learner checks an answer, and the feedback is announced politely.
 * @param {HTMLElement} section
 */
export function selfCheck(section) {
  const questions = [...section.querySelectorAll('fieldset[data-question]')];
  for (const fieldset of questions) {
    const inputs = [...fieldset.querySelectorAll('input[type=radio]')];
    const options = inputs.map((input) => ({
      correct: input.hasAttribute('data-correct'),
      why: input.closest('li')?.querySelector('[data-why]')?.textContent.trim() ?? '',
    }));
    fieldset.querySelectorAll('[data-why]').forEach((el) => { el.hidden = true; });

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Check answer';
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('aria-live', 'polite');
    fieldset.append(button, feedback);

    button.addEventListener('click', () => {
      const result = judge(options, inputs.findIndex((i) => i.checked));
      feedback.textContent = result.message;
      feedback.className = `feedback ${result.status}`;
    });
  }
  return questions.length;
}

/**
 * "Science behind this": checks that the section has every part in
 * SCIENCE_PARTS (marked data-part="..."), warns in the console if not, and
 * makes source links safe to open. Returns the missing parts.
 * @param {HTMLElement} section
 */
export function scienceBox(section) {
  const present = [...section.querySelectorAll('[data-part]')].map((el) => el.dataset.part);
  const missing = missingScienceParts(present);
  if (missing.length) console.warn(`Science behind this is missing: ${missing.join(', ')}`);
  section.querySelectorAll('a[href^="http"]').forEach((a) => { a.rel = 'noopener noreferrer'; });
  return missing;
}

/**
 * Points a back link (default: a[data-back]) at the landing page, two levels
 * up from /<subject>/<name>/, and gives it its standard text if it has none.
 * @param {HTMLAnchorElement | null} [link]
 */
export function backLink(link = document.querySelector('a[data-back]')) {
  if (!link) return null;
  if (!link.getAttribute('href')) link.setAttribute('href', '../../');
  if (!link.textContent.trim()) link.textContent = 'All experiments';
  return link;
}
