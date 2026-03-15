function Added({ children }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm py-1.5 px-3 rounded bg-accent/5 border border-accent/20">
      <span className="text-accent font-bold">+</span>
      <span className="text-accent">{children}</span>
    </div>
  );
}

function Removed({ children }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm py-1.5 px-3 rounded bg-red-500/5 border border-red-500/20">
      <span className="text-red-400 font-bold">−</span>
      <span className="text-red-400">{children}</span>
    </div>
  );
}

function Changed({ label, from, to }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm py-1.5 px-3 rounded bg-yellow-400/5 border border-yellow-400/20">
      <span className="text-yellow-400 font-bold">~</span>
      <span className="text-subtle">{label}</span>
      <span className="text-red-400 line-through">{from ?? 'null'}</span>
      <span className="text-muted">→</span>
      <span className="text-accent">{to ?? 'null'}</span>
    </div>
  );
}

function Unchanged({ label, value }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs py-1 px-3 text-muted">
      <span className="w-3" />
      <span className="text-border">■</span>
      <span>{label}: {value ?? 'null'}</span>
    </div>
  );
}

function Section({ title, icon, children, hasChanges }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 border-b ${hasChanges ? 'border-accent/20 bg-accent/5' : 'border-border bg-surface'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-mono font-semibold text-sm text-text">{title}</span>
        </div>
        {hasChanges
          ? <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">changed</span>
          : <span className="font-mono text-xs text-muted">unchanged</span>
        }
      </div>
      <div className="p-3 space-y-1.5 bg-bg/40">
        {children}
      </div>
    </div>
  );
}

export default function DiffTable({ diff }) {
  const {
    runtimes, env_keys, packages, ports, git, system
  } = diff;

  const runtimeChanged = Object.values(runtimes).some(v => v.changed);
  const envChanged = env_keys.added.length > 0 || env_keys.removed.length > 0;
  const npmChanged = packages.npm_global.added.length > 0 || packages.npm_global.removed.length > 0 || packages.npm_global.changed.length > 0;
  const pipChanged = packages.pip_global.added.length > 0 || packages.pip_global.removed.length > 0 || packages.pip_global.changed.length > 0;
  const portsChanged = ports.added.length > 0 || ports.removed.length > 0;
  const systemChanged = Object.values(system).some(v => v.changed);

  return (
    <div className="space-y-4">

      {/* Runtimes */}
      <Section title="Runtimes" icon="⚙️" hasChanges={runtimeChanged}>
        {Object.entries(runtimes).map(([key, val]) =>
          val.changed
            ? <Changed key={key} label={key} from={val.a} to={val.b} />
            : val.a !== null
              ? <Unchanged key={key} label={key} value={val.a} />
              : null
        )}
      </Section>

      {/* Environment Keys */}
      <Section title="Environment Keys" icon="🔑" hasChanges={envChanged}>
        {env_keys.added.length === 0 && env_keys.removed.length === 0
          ? <p className="font-mono text-xs text-muted px-3 py-1">No changes</p>
          : <>
              {env_keys.added.map(k => <Added key={k}>{k}</Added>)}
              {env_keys.removed.map(k => <Removed key={k}>{k}</Removed>)}
            </>
        }
      </Section>

      {/* npm Packages */}
      <Section title="npm packages (global)" icon="📦" hasChanges={npmChanged}>
        {!npmChanged
          ? <p className="font-mono text-xs text-muted px-3 py-1">No changes</p>
          : <>
              {packages.npm_global.added.map(p => <Added key={p}>{p}</Added>)}
              {packages.npm_global.removed.map(p => <Removed key={p}>{p}</Removed>)}
              {packages.npm_global.changed.map(p => <Changed key={p.name} label={p.name} from={p.from} to={p.to} />)}
            </>
        }
      </Section>

      {/* pip Packages */}
      <Section title="pip packages (global)" icon="🐍" hasChanges={pipChanged}>
        {!pipChanged
          ? <p className="font-mono text-xs text-muted px-3 py-1">No changes</p>
          : <>
              {packages.pip_global.added.map(p => <Added key={p}>{p}</Added>)}
              {packages.pip_global.removed.map(p => <Removed key={p}>{p}</Removed>)}
              {packages.pip_global.changed.map(p => <Changed key={p.name} label={p.name} from={p.from} to={p.to} />)}
            </>
        }
      </Section>

      {/* Ports */}
      <Section title="Open Ports" icon="⚡" hasChanges={portsChanged}>
        {!portsChanged
          ? <p className="font-mono text-xs text-muted px-3 py-1">No changes</p>
          : <>
              {ports.added.map(p => <Added key={p}>:{p}</Added>)}
              {ports.removed.map(p => <Removed key={p}>:{p}</Removed>)}
            </>
        }
      </Section>

      {/* Git */}
      <Section title="Git" icon="⎇" hasChanges={git.branch_changed}>
        {git.branch_changed
          ? <Changed label="branch" from={git.branch_a} to={git.branch_b} />
          : <Unchanged label="branch" value={git.branch_a} />
        }
      </Section>

      {/* System */}
      <Section title="System" icon="💻" hasChanges={systemChanged}>
        {Object.entries(system).map(([key, val]) =>
          val.changed
            ? <Changed key={key} label={key} from={val.a} to={val.b} />
            : <Unchanged key={key} label={key} value={val.a} />
        )}
      </Section>

    </div>
  );
}