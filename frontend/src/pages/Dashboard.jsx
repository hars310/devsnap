import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import SnapshotCard from '../components/SnapshotCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

function Navbar({ onLogout }) {
  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-accent font-bold text-lg tracking-tight">devsnap</span>
          <span className="font-mono text-xs text-muted bg-bg border border-border px-2 py-0.5 rounded">v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.npmjs.com/package/@harshcode/devsnap"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-subtle hover:text-accent transition-colors"
          >
            npm ↗
          </a>
          <button
            onClick={onLogout}
            className="font-mono text-xs text-muted hover:text-red-400 transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="font-mono text-6xl mb-4 opacity-20">[ ]</div>
      <h3 className="font-mono text-text font-semibold mb-2">No snapshots yet</h3>
      <p className="text-subtle text-sm mb-6">Run your first capture from the CLI</p>
      <code className="font-mono text-xs text-accent bg-accent-dim px-4 py-2 rounded-lg border border-accent/20">
        devsnap capture --tag "initial"
      </code>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  const fetchSnapshots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: LIMIT, offset };
      if (search) params.search = search;
      if (tag)    params.tag = tag;
      const res = await api.get('/api/snapshots', { params });
      setSnapshots(res.data.snapshots);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  }, [search, tag, offset]);

  useEffect(() => { fetchSnapshots(); }, [fetchSnapshots]);

  const allTags = [...new Set(snapshots.map(s => s.tag).filter(Boolean))];

  const handleToggleCompare = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const handleDiff = () => {
    if (selected.length === 2) navigate(`/diff?a=${selected[0]}&b=${selected[1]}`);
  };

  const handleSearch = val => { setSearch(val); setOffset(0); };
  const handleTagFilter = val => { setTag(val); setOffset(0); };

  return (
    <div className="min-h-screen">
      <Navbar onLogout={onLogout} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-bold text-text mb-1">Snapshots</h1>
            <p className="text-subtle text-sm">
              {total > 0 ? `${total} total` : 'No snapshots found'}
              {(search || tag) && ' · filtered'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {compareMode && selected.length === 2 && (
              <button
                onClick={handleDiff}
                className="font-mono text-sm bg-accent text-bg px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all active:scale-95"
              >
                Diff selected →
              </button>
            )}
            <button
              onClick={() => { setCompareMode(m => !m); setSelected([]); }}
              className={`font-mono text-sm px-4 py-2 rounded-lg border transition-all ${
                compareMode
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-surface border-border text-subtle hover:border-accent hover:text-accent'
              }`}
            >
              {compareMode ? `Compare (${selected.length}/2)` : 'Compare'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} onTagFilter={handleTagFilter} tags={allTags} />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 font-mono text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl h-44 animate-pulse" />
            ))}
          </div>
        ) : snapshots.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 card-stagger">
              {snapshots.map(s => (
                <SnapshotCard
                  key={s.id}
                  snapshot={s}
                  selected={selected.includes(s.id)}
                  compareMode={compareMode}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>

            {total > LIMIT && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  disabled={offset === 0}
                  onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                  className="font-mono text-sm px-4 py-2 rounded-lg border border-border text-subtle hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← prev
                </button>
                <span className="font-mono text-xs text-muted">
                  {Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
                </span>
                <button
                  disabled={offset + LIMIT >= total}
                  onClick={() => setOffset(o => o + LIMIT)}
                  className="font-mono text-sm px-4 py-2 rounded-lg border border-border text-subtle hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}