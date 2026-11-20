const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function landing(apps) {
  const items = apps
    .map(
      (a) => `<li>
  <a href="./${esc(a.name)}/">
    <span class="t">${esc(a.title)}</span>
    <span class="s">${esc(a.summary)}</span>
    <span class="m">${esc(a.level)}${a.tags?.length ? ' · ' + a.tags.map(esc).join(', ') : ''}</span>
  </a>
</li>`
    )
    .join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chem Lab</title>
<style>
  :root { --ink:#16232d; --bench:#e8edef; --line:#b9c5cb; --muted:#4a5b66; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bench); color:var(--ink); font:1rem/1.55 "Avenir Next","Segoe UI",system-ui,sans-serif; }
  body::before { content:""; display:block; height:8px;
    background:linear-gradient(90deg,#e11d2e,#ef4a23,#f6a21e,#e8d92a,#4fb34a,#23a58a,#2a6fc2,#5b3fb0,#7a2a8f); }
  main { max-width: 44rem; margin: 0 auto; padding: 3rem 1.25rem 4rem; }
  h1 { font-size: clamp(2rem, 6vw, 3rem); line-height:1.1; margin:0 0 .5rem; }
  p.lead { color: var(--muted); margin:0 0 2.5rem; max-width: 34rem; }
  ul { list-style:none; margin:0; padding:0; border-top:1px solid var(--line); }
  li { border-bottom:1px solid var(--line); }
  a { display:block; padding:1.1rem .25rem; color:inherit; text-decoration:none; }
  a:hover .t { text-decoration: underline; }
  a:focus-visible { outline:3px solid #2a6fc2; outline-offset:2px; }
  .t { display:block; font-size:1.25rem; font-weight:600; }
  .s { display:block; color:var(--muted); }
  .m { display:block; font-size:.875rem; color:var(--muted); margin-top:.25rem; }
</style>
</head>
<body>
<main>
  <h1>Chem Lab</h1>
  <p class="lead">Chemistry concepts you can test in your browser. Pick one, change the settings, and watch what happens.</p>
  <ul>
${items}
  </ul>
</main>
</body>
</html>
`;
}
