// Generates dist/index.html, the landing page, from validated metadata.
// Experiments are grouped by subject, then ordered by step and title. Drafts
// are left out. Pure, so it is tested in scripts/landing.test.mjs.
import { LEVEL_LABELS } from './meta.mjs';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Published experiments grouped by subject (alphabetical), each group ordered
 * by step, then title.
 * @param {{ path: string, subject: string, step: number, title: string, status: string }[]} apps
 * @returns {{ subject: string, apps: object[] }[]}
 */
export function groupForLanding(apps) {
  const published = apps.filter((a) => a.status !== 'draft');
  const subjects = [...new Set(published.map((a) => a.subject))].sort();
  return subjects.map((subject) => ({
    subject,
    apps: published
      .filter((a) => a.subject === subject)
      .sort((a, b) => a.step - b.step || a.title.localeCompare(b.title)),
  }));
}

function item(app, byPath) {
  const before = (app.prerequisites ?? [])
    .map((p) => byPath.get(p))
    .filter(Boolean)
    .map((p) => `<a href="./${esc(p.path)}/">${esc(p.title)}</a>`);
  return `<li>
  <a class="card" href="./${esc(app.path)}/">
    <span class="step">Step ${esc(app.step)}</span>
    <span class="t">${esc(app.title)}</span>
    <span class="s">${esc(app.summary)}</span>
    <span class="m">${esc(LEVEL_LABELS[app.level] ?? app.level)}</span>
  </a>${before.length ? `\n  <p class="pre">Do first: ${before.join(', ')}</p>` : ''}
</li>`;
}

/** The landing page HTML. */
export function landing(apps) {
  const byPath = new Map(apps.map((a) => [a.path, a]));
  const groups = groupForLanding(apps)
    .map(
      ({ subject, apps: list }) => `  <section>
  <h2>${esc(capitalise(subject))}</h2>
  <ul>
${list.map((a) => item(a, byPath)).join('\n')}
  </ul>
  </section>`
    )
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chenji Labs: Digital Science Labs</title>
<meta name="description" content="The future of digital science labs. Free, open source science experiments you can run in your browser, starting with chemistry.">
<style>
  :root { --ink:#16232d; --bench:#e8edef; --line:#b9c5cb; --muted:#4a5b66; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bench); color:var(--ink); font:1rem/1.55 "Avenir Next","Segoe UI",system-ui,sans-serif; }
  body::before { content:""; display:block; height:8px;
    background:linear-gradient(90deg,#e11d2e,#ef4a23,#f6a21e,#e8d92a,#4fb34a,#23a58a,#2a6fc2,#5b3fb0,#7a2a8f); }
  main { max-width: 44rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
  h1 { font-size: clamp(2rem, 6vw, 3rem); line-height:1.1; margin:0 0 .5rem; }
  h2 { font-size: 1.1rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin: 0 0 .5rem; }
  p.tagline { font-size:1.25rem; font-weight:600; margin:0 0 .75rem; }
  p.lead { color: var(--muted); margin:0 0 2.5rem; max-width: 34rem; }
  ul { list-style:none; margin:0 0 2.5rem; padding:0; border-top:1px solid var(--line); }
  li { border-bottom:1px solid var(--line); padding-bottom: .25rem; }
  a { color: inherit; }
  a.card { display:block; padding:1.1rem .25rem .6rem; text-decoration:none; }
  a.card:hover .t { text-decoration: underline; }
  a:focus-visible { outline:3px solid #2a6fc2; outline-offset:2px; }
  .step { display:block; font-size:.8rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  .t { display:block; font-size:1.25rem; font-weight:600; }
  .s { display:block; color:var(--muted); }
  .m { display:block; font-size:.875rem; color:var(--muted); margin-top:.25rem; }
  .pre { font-size:.875rem; margin:0 .25rem .6rem; }
</style>
</head>
<body>
<main>
  <h1>Chenji Labs</h1>
  <p class="tagline">The future of digital science labs.</p>
  <p class="lead">Science practicals you can run in your browser, starting with chemistry. Pick an experiment, change the settings, and watch what happens.</p>
${groups}
</main>
</body>
</html>
`;
}
