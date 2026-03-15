import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSearch, onTagFilter, tags = [] }) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer.current);
  }, [query]);

  const handleTag = tag => {
    const next = activeTag === tag ? '' : tag;
    setActiveTag(next);
    onTagFilter(next);
  };

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors font-mono"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              className={`font-mono text-xs px-2.5 py-1 rounded-md border transition-all ${
                activeTag === tag
                  ? 'bg-accent text-bg border-accent'
                  : 'bg-surface border-border text-subtle hover:border-accent hover:text-accent'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}