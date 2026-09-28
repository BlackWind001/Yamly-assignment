import { useRef, useState, type SubmitEvent } from 'react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (q) setSubmitted(q);
  }

  function clear() {
    setQuery('');
    inputRef.current?.focus();
  }

  return (
    <aside className={submitted === null ? 'lib-search-pane' : 'lib-search-pane has-results'} aria-label="Search">
      <div className="lib-search">
        <div className="lib-search__hero">
          <div className="lib-search__hero-inner">
            <div className="lib-eyebrow">Library</div>
            <h1 className="lib-search__title">What are you looking for?</h1>
          </div>
        </div>
        <form className="lib-searchbar" role="search" onSubmit={onSubmit}>
          <svg className="lib-searchbar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <label className="lib-sr-only" htmlFor="q">Search documents</label>
          <input
            ref={inputRef}
            className="lib-searchbar__input"
            id="q"
            type="search"
            placeholder="Search documents, notes, policies…"
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" className="lib-searchbar__clear" aria-label="Clear search" onClick={clear}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          )}
        </form>
        <div className="lib-search__hint">Press Enter to search</div>
      </div>
      <div className="lib-results">
        <div className="lib-results__count" aria-live="polite">
          {submitted !== null && `0 passages related to “${submitted}”`}
        </div>
        <div className="lib-results__scroll">
          <ul className="lib-results__list" />
        </div>
      </div>
    </aside>
  );
}
