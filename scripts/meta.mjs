// Experiment metadata (app.json): the rules, in one place. Pure, so every rule
// is tested in scripts/meta.test.mjs. build-all.mjs calls validateApps() and
// stops on any error.

export const STEPS = { min: 1, max: 6 };
export const KINDS = ['practical', 'explorer'];
export const LEVELS = ['junior-secondary', 'senior-secondary', 'first-year-university'];
export const STATUSES = ['draft', 'published'];

export const LEVEL_LABELS = {
  'junior-secondary': 'Junior secondary',
  'senior-secondary': 'Senior secondary',
  'first-year-university': 'First-year university',
};

const PATH = /^[a-z0-9]+(-[a-z0-9]+)*\/[a-z0-9]+(-[a-z0-9]+)*$/;
const list = (values) => values.map((v) => `"${v}"`).join(', ');

/**
 * Checks every experiment's metadata and the links between them.
 * @param {{ path: string, file: string, meta: object }[]} apps
 *   path is "subject/name"; file is the app.json path used in messages
 * @returns {{ errors: string[], warnings: string[], apps: object[] }}
 *   apps carry their metadata plus path, subject, name and a defaulted status
 */
export function validateApps(apps) {
  const errors = [];
  const warnings = [];
  const byPath = new Map(apps.map((a) => [a.path, a]));

  for (const { path, file, meta } of apps) {
    const fail = (field, message) => errors.push(`${file}: "${field}" ${message}`);

    for (const field of ['title', 'summary']) {
      if (typeof meta[field] !== 'string' || !meta[field].trim()) fail(field, 'is required and must be a non-empty string');
    }
    if (!Number.isInteger(meta.step) || meta.step < STEPS.min || meta.step > STEPS.max) {
      fail('step', `must be a whole number from ${STEPS.min} to ${STEPS.max} (got ${JSON.stringify(meta.step)})`);
    }
    if (!KINDS.includes(meta.kind)) fail('kind', `must be one of ${list(KINDS)} (got ${JSON.stringify(meta.kind)})`);
    if (!LEVELS.includes(meta.level)) fail('level', `must be one of ${list(LEVELS)} (got ${JSON.stringify(meta.level)})`);
    if (meta.status !== undefined && !STATUSES.includes(meta.status)) {
      fail('status', `must be one of ${list(STATUSES)} if present (got ${JSON.stringify(meta.status)})`);
    }

    if (!Array.isArray(meta.prerequisites)) {
      fail('prerequisites', 'is required: a list of "subject/name" entries, or [] for none');
    } else {
      for (const pre of meta.prerequisites) {
        if (typeof pre !== 'string' || !PATH.test(pre)) {
          fail('prerequisites', `entry ${JSON.stringify(pre)} must look like "subject/name", for example "chemistry/gas-laws"`);
        } else if (pre === path) {
          fail('prerequisites', `cannot list the experiment itself ("${pre}")`);
        } else if (!byPath.has(pre)) {
          fail('prerequisites', `entry "${pre}" does not exist (no apps/${pre}/app.json)`);
        } else {
          const preStep = byPath.get(pre).meta.step;
          if (Number.isInteger(preStep) && Number.isInteger(meta.step) && preStep > meta.step) {
            fail('prerequisites', `entry "${pre}" is at step ${preStep}, after this experiment's step ${meta.step}; a prerequisite must be at the same step or earlier`);
          }
        }
      }
    }

    if (meta.sources === undefined || (Array.isArray(meta.sources) && meta.sources.length === 0)) {
      warnings.push(`${file}: no "sources" yet. Add at least one real source before Gate 2.`);
    } else if (!Array.isArray(meta.sources)) {
      fail('sources', 'must be a list of { "title", and "url" or "isbn" } if present');
    } else {
      meta.sources.forEach((s, i) => {
        if (!s || typeof s.title !== 'string' || !(typeof s.url === 'string' || typeof s.isbn === 'string')) {
          fail('sources', `entry ${i + 1} needs a "title" and a "url" or "isbn"`);
        }
      });
    }
  }

  for (const cycle of findCycles(apps)) errors.push(`Prerequisite cycle: ${cycle.join(' → ')}`);

  return {
    errors,
    warnings,
    apps: apps.map(({ path, meta }) => {
      const [subject, name] = path.split('/');
      return { ...meta, path, subject, name, status: meta.status ?? 'published' };
    }),
  };
}

/** Every prerequisite cycle, each as a list of paths that returns to its start. */
export function findCycles(apps) {
  const edges = new Map(apps.map((a) => [a.path, Array.isArray(a.meta.prerequisites) ? a.meta.prerequisites : []]));
  const cycles = [];
  const done = new Set();
  const visit = (node, stack) => {
    if (stack.includes(node)) {
      cycles.push([...stack.slice(stack.indexOf(node)), node]);
      return;
    }
    if (done.has(node) || !edges.has(node)) return;
    for (const next of edges.get(node)) visit(next, [...stack, node]);
    done.add(node);
  };
  for (const node of edges.keys()) visit(node, []);
  return cycles;
}
