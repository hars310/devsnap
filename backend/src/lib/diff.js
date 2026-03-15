// Semantic diff engine — do NOT replace with a generic JSON diff library.
// The structured per-category output is what makes devsnap useful.

// Parse package string into { name, version }
// Handles both npm format ('name@version') and pip format ('name==version')
function parsePkg(str) {
  // pip freeze format: 'requests==2.31.0'
  const eqIdx = str.indexOf('==');
  if (eqIdx > 0) {
    return { name: str.slice(0, eqIdx), version: str.slice(eqIdx + 2) };
  }
  // npm format: 'typescript@5.3.3' (use lastIndexOf to handle scoped @org/pkg@version)
  const lastAt = str.lastIndexOf('@');
  if (lastAt <= 0) return { name: str, version: null };
  return { name: str.slice(0, lastAt), version: str.slice(lastAt + 1) };
}

// Diff two flat objects — returns per-key { a, b, changed }
function diffObjects(a = {}, b = {}) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result = {};
  for (const k of keys) {
    result[k] = {
      a: a[k] ?? null,
      b: b[k] ?? null,
      changed: a[k] !== b[k],
    };
  }
  return result;
}

// Diff two package arrays — returns { added, removed, changed }
// 'changed' means same package name, different version
function diffPackages(arrA = [], arrB = []) {
  const mapA = new Map(arrA.map(p => {
    const { name, version } = parsePkg(p);
    return [name, version];
  }));
  const mapB = new Map(arrB.map(p => {
    const { name, version } = parsePkg(p);
    return [name, version];
  }));

 const origB = new Map(arrB.map(p => { const { name } = parsePkg(p); return [name, p]; }));
const origA = new Map(arrA.map(p => { const { name } = parsePkg(p); return [name, p]; }));
const added   = [...mapB.keys()].filter(k => !mapA.has(k)).map(k => origB.get(k));
const removed = [...mapA.keys()].filter(k => !mapB.has(k)).map(k => origA.get(k));
  const changed = [...mapA.keys()]
    .filter(k => mapB.has(k) && mapA.get(k) !== mapB.get(k))
    .map(k => ({ name: k, from: mapA.get(k), to: mapB.get(k) }));

  return { added, removed, changed };
}

export function diffSnapshots(a, b) {
  const da = a.data;
  const db = b.data;

  const diff = {
    runtimes: diffObjects(da.runtimes, db.runtimes),

    env_keys: {
      added:   (db.env_keys ?? []).filter(k => !(da.env_keys ?? []).includes(k)),
      removed: (da.env_keys ?? []).filter(k => !(db.env_keys ?? []).includes(k)),
    },

    packages: {
      npm_global: diffPackages(da.packages?.npm_global, db.packages?.npm_global),
      pip_global: diffPackages(da.packages?.pip_global, db.packages?.pip_global),
    },

    ports: {
      added:   (db.ports ?? []).filter(p => !(da.ports ?? []).includes(p)),
      removed: (da.ports ?? []).filter(p => !(db.ports ?? []).includes(p)),
    },

    git: {
      branch_changed: da.git?.branch !== db.git?.branch,
      branch_a: da.git?.branch ?? null,
      branch_b: db.git?.branch ?? null,
    },

    system: diffObjects(da.system, db.system),
  };

  // has_changes = true if anything changed
  // NOTE: spec omits pip_global — included here intentionally (spec bug)
  diff.has_changes = (
    Object.values(diff.runtimes).some(v => v.changed) ||
    diff.env_keys.added.length > 0 ||
    diff.env_keys.removed.length > 0 ||
    diff.packages.npm_global.added.length > 0 ||
    diff.packages.npm_global.removed.length > 0 ||
    diff.packages.npm_global.changed.length > 0 ||
    diff.packages.pip_global.added.length > 0 ||   // spec omitted this
    diff.packages.pip_global.removed.length > 0 || // spec omitted this
    diff.packages.pip_global.changed.length > 0 || // spec omitted this
    diff.ports.added.length > 0 ||
    diff.ports.removed.length > 0 ||
    diff.git.branch_changed
  );

  return diff;
}