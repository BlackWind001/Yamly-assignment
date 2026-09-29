import { Fragment, useEffect, useRef, useState, type SubmitEvent } from 'react';
import Markdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import { parseDocument, sectionPath, type DocumentFrontmatter } from '../document/parseDocument';
import { getMockAnswer } from '../search/getMockAnswer';

type ShownFragment = {
  key: string;
  docId: string;
  body: string | null;
  label: string;
  frontmatter: DocumentFrontmatter;
  sections: string[];
};

function documentId(doc: string): string {
  const name = doc.split('/').pop() ?? doc;
  return name.endsWith('.md') ? name.slice(0, -3) : name;
}

function countLabel(fragments: ShownFragment[] | null, question: string): string {
  if (fragments === null) return 'Searching…';
  return `${fragments.length} ${fragments.length === 1 ? 'passage' : 'passages'} related to “${question}”`;
}

export function SearchPage() {
  const { id: openId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [fragments, setFragments] = useState<ShownFragment[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (submitted === null) {
      return;
    }

    const answer = getMockAnswer(submitted);
    if (!answer) {
      setFragments([]);
      return;
    }

    let cancelled = false;
    setFragments(null);

    const ids = [...new Set(answer.fragments.map((fragment) => documentId(fragment.doc)))];
    Promise.all(
      ids.map(async (id) => {
        const result = await window.electronAPI.readDocument(id);
        const parsed = result.found && result.content != null ? parseDocument(result.content) : null;
        return [id, parsed] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) {
          return;
        }
        const byId = new Map(entries);
        setFragments(
          answer.fragments.map((fragment) => {
            const docId = documentId(fragment.doc);
            const parsed = byId.get(docId);
            return {
              key: `${fragment.doc}:${fragment.frag}`,
              docId,
              label: fragment.frag,
              body: parsed?.fragments.find((item) => item.id === fragment.frag)?.body ?? null,
              frontmatter: parsed?.frontmatter ?? {},
              sections: parsed ? sectionPath(parsed.blocks, fragment.frag) : [],
            };
          }),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setFragments([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [submitted]);

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    inputRef.current?.blur();
    const q = query.trim();
    if (!q) {
      setSubmitted(null);
      setFragments(null);
      return;
    }
    setSubmitted(q);
  }

  function clear() {
    setQuery('');
    inputRef.current?.focus();
  }

  function open(fragment: ShownFragment) {
    setSelected(fragment.key);
    navigate(`/document/${fragment.docId}?frag=${encodeURIComponent(fragment.label)}`);
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
          {submitted !== null && countLabel(fragments, submitted)}
        </div>
        <div className="lib-results__scroll">
          <ul className="lib-results__list">
            {fragments?.map((fragment) => {
              const { title, status, last_updated } = fragment.frontmatter;
              return (
                <li key={fragment.key}>
                  <button
                    type="button"
                    className="lib-result"
                    aria-pressed={openId !== undefined && selected === fragment.key}
                    onClick={() => open(fragment)}
                  >
                    <span className="lib-snippet">
                      {fragment.body ? (
                        // Buttons only allow inline content: keep emphasis, unwrap paragraphs, lists and links.
                        <Markdown allowedElements={['strong', 'em', 'code']} unwrapDisallowed>
                          {fragment.body}
                        </Markdown>
                      ) : (
                        fragment.label
                      )}
                    </span>
                    <span className="lib-result__meta">
                      <span className="lib-breadcrumb" title={[title ?? fragment.docId, ...fragment.sections].join(' › ')}>
                        <span className="lib-breadcrumb__doc">{title ?? fragment.docId}</span>
                        {fragment.sections.map((section) => (
                          <Fragment key={section}>
                            <svg className="lib-breadcrumb__sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="9 6 15 12 9 18" />
                            </svg>
                            {section}
                          </Fragment>
                        ))}
                      </span>
                      <span className="lib-result__sub">
                        {(status === 'stale' || status === 'abandoned') && (
                          <span className={`lib-pill lib-pill--sm lib-pill--${status}`}>
                            {status === 'stale' ? 'Stale' : 'Abandoned'}
                          </span>
                        )}
                        {last_updated && <span>Updated {last_updated}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
