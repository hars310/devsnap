import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';

function DataSection({ title, icon, children }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border">
        <span>{icon}</span>
        <span className="font-mono font-semibold text-sm text-text">{title}</span>
      </div>
      <div className="p-4 bg-bg/40">
        {children}
      </div>
    </div>
  );
}

function KVRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="font-mono text-xs text-subtle">{label}</span>
      <span className={`font-mono text-xs ${highlight ? 'text-accent' : 'text-text'} ${value === 'null' || value === null ? 'text-muted' : ''}`}>
        {value === null || value === undefined ? 'null' : String(value)}
      </span>
    </div>
  );
}

function TagPill({ children }) {
  return (
    <span className="font-mono text-xs px-2 py-0.5 rounded border text-text bg-bg border-border">
      {children}
    </span>
  );
}

export default function SnapshotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/api/snapshots/${id}`)
      .then(res => setSnapshot(res.data))
      .catch(err => setError(err.response?.data?.error ?? 'Not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this snapshot? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/snapshots/${id}`);
      navigate('/');
    } catch {
      setDeleting(false);
      alert('Failed to delete snapshot');
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-mono text-subtle animate-pulse">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-red-400 mb-4">{error}</p>
        <Link to="/" className="font-mono text-xs text-accent hover:underline">← back to dashboard</Link>
      </div>
    </div>
  );

  const { data, tag, note, created_at } = snapshot;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-mono text-sm text-subtle hover:text-accent transition-colors">
              ← snapshots
            </Link>
            <span className="text-border">|</span>
            <button
              onClick={handleCopyId}
              className="font-mono text-sm text-accent hover:text-text transition-colors"
            >
              {copied ? '✓ copied' : id.slice(0, 8)}
            </button>
            {tag && <span className="font-mono text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">#{tag}</span>}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="font-mono text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg"
          >
            {deleting ? 'deleting...' : 'delete'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {/* Meta */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-muted mb-1">{new Date(created_at).toLocaleString()}</p>
              {note && <p className="text-text text-sm">{note}</p>}
              {!note && <p className="text-muted text-sm italic">No note</p>}
            </div>
            <Link
              to={`/?compare=${id}`}
              className="font-mono text-xs text-accent border border-accent/30 hover:border-accent px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              compare →
            </Link>
          </div>
        </div>

        {/* System */}
        <DataSection title="System" icon="💻">
          <KVRow label="os" value={data.system?.os} highlight />
          <KVRow label="os_version" value={data.system?.os_version} />
          <KVRow label="arch" value={data.system?.arch} />
          <KVRow label="hostname" value={data.system?.hostname} />
          <KVRow label="cpu_cores" value={data.system?.cpu_cores} />
          <KVRow label="memory_gb" value={data.system?.memory_gb != null ? `${data.system.memory_gb} GB` : null} />
          <KVRow label="shell" value={data.system?.shell} />
        </DataSection>

        {/* Runtimes */}
        <DataSection title="Runtimes" icon="⚙️">
          {Object.entries(data.runtimes ?? {}).map(([k, v]) => (
            <KVRow key={k} label={k} value={v} highlight={v !== null} />
          ))}
        </DataSection>

        {/* Packages */}
        <DataSection title="npm packages (global)" icon="📦">
          {(data.packages?.npm_global ?? []).length === 0
            ? <p className="font-mono text-xs text-muted">none</p>
            : <div className="flex flex-wrap gap-1.5">
                {(data.packages?.npm_global ?? []).map(p => <TagPill key={p}>{p}</TagPill>)}
              </div>
          }
        </DataSection>

        <DataSection title="pip packages (global)" icon="🐍">
          {(data.packages?.pip_global ?? []).length === 0
            ? <p className="font-mono text-xs text-muted">none</p>
            : <div className="flex flex-wrap gap-1.5">
                {(data.packages?.pip_global ?? []).map(p => <TagPill key={p}>{p}</TagPill>)}
              </div>
          }
        </DataSection>

        {/* Env keys */}
        <DataSection title="Environment Keys (keys only — no values)" icon="🔑">
          <div className="flex flex-wrap gap-1.5">
            {(data.env_keys ?? []).map(k => (
              <span key={k} className="font-mono text-xs px-2 py-0.5 rounded border text-subtle border-border bg-bg">
                {k}
              </span>
            ))}
          </div>
        </DataSection>

        {/* Git */}
        <DataSection title="Git" icon="⎇">
          <KVRow label="branch" value={data.git?.branch} highlight />
          <KVRow label="dirty" value={String(data.git?.dirty ?? 'null')} />
          {(data.git?.commits ?? []).map(c => (
            <div key={c.hash} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
              <span className="font-mono text-xs text-accent shrink-0">{c.hash}</span>
              <span className="font-mono text-xs text-text truncate flex-1">{c.message}</span>
              <span className="font-mono text-xs text-muted shrink-0">{c.ago}</span>
            </div>
          ))}
        </DataSection>

        {/* Ports */}
        <DataSection title="Open Ports" icon="⚡">
          {(data.ports ?? []).length === 0
            ? <p className="font-mono text-xs text-muted">none</p>
            : <div className="flex flex-wrap gap-2">
                {(data.ports ?? []).map(p => (
                  <span key={p} className="font-mono text-xs text-accent bg-accent-dim border border-accent/20 px-2.5 py-1 rounded-lg">
                    :{p}
                  </span>
                ))}
              </div>
          }
        </DataSection>

        {/* Captured at */}
        <p className="font-mono text-xs text-muted text-center pt-2">
          captured at {data.captured_at}
        </p>
      </main>
    </div>
  );
}