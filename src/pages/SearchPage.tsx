import { useEffect, useState, type FormEvent } from 'react';
import Markdown from 'react-markdown';
import { parseDocument } from '../document/parseDocument';
import { getMockAnswer } from '../search/getMockAnswer';

type ShownFragment = {
  key: string;
  body: string | null;
  label: string;
};

function documentId(doc: string): string {
  const name = doc.split('/').pop() ?? doc;
  return name.endsWith('.md') ? name.slice(0, -3) : name;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [fragments, setFragments] = useState<ShownFragment[] | null>(null);

  useEffect(() => {
    if (submitted == null) {
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
          answer.fragments.map((fragment) => ({
            key: `${fragment.doc}:${fragment.frag}`,
            label: fragment.frag,
            body:
              byId.get(documentId(fragment.doc))?.fragments.find((item) => item.id === fragment.frag)?.body ??
              null,
          })),
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.querySelector('input')?.blur();
    const question = query.trim();
    if (!question) {
      setSubmitted(null);
      setFragments(null);
      return;
    }
    setSubmitted(question);
  };

  const hasResults = submitted != null;

  return (
    <div className={`search-page${hasResults ? ' has-results' : ''}`}>
      <div className="search-page-spacer" />
      <form className="search-page-bar" onSubmit={onSubmit}>
        <div className="notion-search">
          <input
            className="notion-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            autoFocus
          />
        </div>
      </form>
      <div className="search-page-results">
        {hasResults && fragments === null && <p className="search-page-status">Loading...</p>}
        {hasResults && fragments?.length === 0 && <p className="search-page-status">No results</p>}
        {fragments && fragments.length > 0 && (
          <article className="notion-page">
            {fragments.map((fragment) =>
              fragment.body ? (
                <Markdown key={fragment.key}>{fragment.body}</Markdown>
              ) : (
                <p key={fragment.key}>{fragment.label}</p>
              ),
            )}
          </article>
        )}
      </div>
      <div className="search-page-spacer" />
    </div>
  );
}
