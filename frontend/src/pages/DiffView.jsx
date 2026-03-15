import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import DiffTable from '../components/DiffTable.jsx';

function SnapshotMeta({ snapshot, side }) {
  const color = side === 'a' ? 'text-red-400 border-red-400/30 bg-red-400/5' : 'text-accent border-accent/30 bg-accent/5';
  const label = side === 'a' ? 'A · before' : 'B · after';
  return (
    <div className={`border rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs font-bold">{label}</span>
        {snapshot.tag && (
          <span className="font-mono text-xs px-2 py-0.5 rounded border border-current opacity-70">
            #{snapshot.tag}
          </span>
        )}
      </div>
      <p className="font-mono text-xs opacity-70">{snapshot.id.slice(0, 8)}</p>
      <p className="font-mono text-xs opacity-50">{new Date(snapshot.created_at).toLocaleString()}</p>
    </div>
  );
}

export default function DiffView() {
  const [searchParams] = useSearchParams();
  const a = searchParams.get('a');
  const b = searchParams.get('b');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!a || !b) { setError('Missing snapshot IDs'); setLoading(false); return; }

    api.get('/api/diff', { params: { a, b } })
      .then(res => setResult(res.data))
      .catch(err => setError(err.response?.data?.error ?? 'Failed to load diff'))
      .finally(() => setLoading(false));
  }, [a, b]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/" className="font-mono text-sm text-subtle hover:text-accent transition-colors">
            ← snapshots
          </Link>
          <span className="text-border">|</span>
          <span className="font-mono text-sm text-text">diff</span>
          {result && (
            <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
              result.diff.has_changes
                ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5'
                : 'text-accent border-accent/30 bg-accent/5'
            }`}>
              {result.diff.has_changes ? 'changes detected' : 'identical'}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="font-mono text-subtle animate-pulse">Computing diff...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="font-mono text-red-400 mb-3">{error}</p>
            <Link to="/" className="font-mono text-xs text-accent hover:underline">← back to dashboard</Link>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-up">
            {/* Snapshot meta */}
            <div className="grid grid-cols-2 gap-3">
              <SnapshotMeta snapshot={result.snapshot_a} side="a" />
              <SnapshotMeta snapshot={result.snapshot_b} side="b" />
            </div>

            {/* No changes */}
            {!result.diff.has_changes && (
              <div className="text-center py-16 border border-accent/20 rounded-xl bg-accent/5">
                <div className="font-mono text-4xl mb-3">✓</div>
                <h3 className="font-mono text-accent font-semibold mb-1">No differences</h3>
                <p className="text-subtle text-sm">These two snapshots are identical</p>
              </div>
            )}

            {/* Diff table */}
            {result.diff.has_changes && (
              <DiffTable diff={result.diff} />
            )}

            {/* Share link */}
            <div className="border border-border rounded-xl p-4 flex items-center justify-between gap-4 bg-surface">
              <div>
                <p className="font-mono text-xs text-subtle mb-0.5">Shareable link</p>
                <p className="font-mono text-xs text-muted truncate max-w-xs">{window.location.href}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="font-mono text-xs text-accent border border-accent/30 hover:border-accent px-3 py-1.5 rounded-lg transition-colors shrink-0"
              >
                copy link
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}