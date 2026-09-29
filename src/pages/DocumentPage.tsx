import { useEffect, useState } from 'react';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  parseDocument,
  type DocumentBlock,
  type DocumentFrontmatter,
  type ParsedDocument,
} from '../document/parseDocument';

type DocumentState = ({ found: true } & ParsedDocument) | { found: false };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FORMATS = { md: 'Markdown', docx: 'From .docx', pdf: 'From .pdf', txt: 'From .txt' };

// Docs link to each other by filename ("03-payments-design.md"); route those inside the app.
function urlTransform(url: string): string {
  const doc = /^([\w-]+)\.md$/.exec(url);
  return doc ? `#/document/${doc[1]}` : defaultUrlTransform(url);
}

// "2025-02-20" -> "20 Feb 2025" and "1 year ago"
function formatUpdated(iso: string): { date: string; age: string } {
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m) - (now.getDate() < d ? 1 : 0);
  const years = Math.floor(months / 12);
  const age =
    months < 1 ? 'this month'
    : months < 12 ? `${months} ${months === 1 ? 'month' : 'months'} ago`
    : `${years} ${years === 1 ? 'year' : 'years'} ago`;
  return { date: `${d} ${MONTHS[m - 1]} ${y}`, age };
}

// The body repeats the title as its first heading; the header already shows it.
function withoutTitle(blocks: DocumentBlock[], title?: string): DocumentBlock[] {
  const first = blocks[0];
  if (!title || first?.kind !== 'markdown') return blocks;
  const text = first.text.replace(/^#\s+(.+)(\r?\n|$)/, (line, heading: string) => (title.startsWith(heading.trim()) ? '' : line)).trim();
  return text ? [{ kind: 'markdown', text }, ...blocks.slice(1)] : blocks.slice(1);
}

function DocumentHeader({ frontmatter }: { frontmatter: DocumentFrontmatter }) {
  const { title, author, last_updated, status = 'active', original_format } = frontmatter;
  const updated = last_updated ? formatUpdated(last_updated) : null;
  // "Name (Role), reviewed by …" -> name "Name", role "Role, reviewed by …"
  const byline = author?.match(/^\s*([^(]+?)\s*(?:\(([^)]+)\)(.*))?$/);
  const name = byline?.[1];
  const role = byline?.[2] && byline[2] + byline[3].trimEnd();

  return (
    <header className="lib-doc-header">
      <div className="lib-doc-meta">
        {status === 'active' && <span className="lib-status-active">Active</span>}
        {status === 'stale' && <span className="lib-pill lib-pill--stale">Stale</span>}
        {status === 'abandoned' && <span className="lib-pill lib-pill--abandoned">Abandoned</span>}
        {updated && (
          <span>
            Updated <time dateTime={last_updated}>{updated.date}</time> · {updated.age}
          </span>
        )}
        {original_format && (
          <span className="lib-doc-format">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <polyline points="14 3 14 8 19 8" />
            </svg>
            {FORMATS[original_format]}
          </span>
        )}
      </div>
      {title && <h1 className="lib-doc-title">{title}</h1>}
      {name && (
        <div className="lib-byline">
          <span className="lib-byline__avatar" aria-hidden="true">
            {name.split(/\s+/).map((word) => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
          </span>
          <span className="lib-byline__text">
            <span className="lib-byline__name">{name}</span>
            {role && <span className="lib-byline__role">{role}</span>}
          </span>
        </div>
      )}
    </header>
  );
}

const WEIGHT_LABELS = { critical: 'Critical', helpful: 'Helpful', background: 'Background' };

const TAG_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);

export function FragmentDetailsIcon() {
  return TAG_ICON;
}

type DocumentPageProps = {
  // Reading mode: the toolbar's "show details for all parts" state, owned by the shell.
  showAllFrags: boolean;
  setShowAllFrags: (show: boolean) => void;
};

export function DocumentPage({ showAllFrags, setShowAllFrags }: DocumentPageProps) {
  const { id } = useParams();
  const frag = useSearchParams()[0].get('frag');
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [highlighted, setHighlighted] = useState(false);
  // Reading mode: parts revealed one at a time with their margin button.
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!id) {
      setDocument({ found: false });
      return;
    }

    let cancelled = false;
    setDocument(null);
    setRevealed(new Set());
    window.electronAPI.readDocument(id).then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.found || result.content == null) {
        setDocument({ found: false });
        return;
      }
      setDocument({ found: true, ...parseDocument(result.content) });
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const target = frag && document?.found ? window.document.getElementById(frag) : null;
    const scroller = target?.closest<HTMLElement>('.lib-doc-pane__scroll');
    if (!target || !scroller) {
      return;
    }
    // Vertical only: scrollIntoView would also scroll the pane sideways while it is still narrow.
    const scroll = () => {
      scroller.scrollTop += target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    };
    scroll();

    // While the pane is opening its width animates and the text reflows; scroll again once it settles.
    const pane = scroller.parentElement;
    if (!pane?.getAnimations().length) {
      return;
    }
    const onEnd = (event: TransitionEvent) => {
      if (event.target === pane && event.propertyName === 'width') {
        scroll();
        pane.removeEventListener('transitionend', onEnd);
      }
    };
    pane.addEventListener('transitionend', onEnd);
    return () => pane.removeEventListener('transitionend', onEnd);
  }, [document, frag]);

  // The matched passage is washed briefly, then fades back (the background transition lives in .lib-doc-block).
  useEffect(() => {
    if (!frag || !document?.found) {
      return;
    }
    setHighlighted(true);
    const timer = setTimeout(() => setHighlighted(false), 3000);
    return () => clearTimeout(timer);
  }, [document, frag]);

  function toggleFragment(fragmentId: string) {
    if (!document?.found) {
      return;
    }
    if (showAllFrags || revealed.has(fragmentId)) {
      // Revealed by "show all": turn it off but keep the other parts open, so only this one hides.
      const next = new Set(showAllFrags ? document.fragments.map((fragment) => fragment.id) : revealed);
      next.delete(fragmentId);
      setRevealed(next);
      setShowAllFrags(false);
    } else {
      setRevealed(new Set(revealed).add(fragmentId));
    }
  }

  if (document === null) {
    return <p>Loading...</p>;
  }

  if (!document.found) {
    return <h1>Document not found</h1>;
  }

  return (
    <article className="lib-doc">
      <DocumentHeader frontmatter={document.frontmatter} />
      <hr className="lib-doc-divider" />
      {withoutTitle(document.blocks, document.frontmatter.title).map((block, index) => {
        if (block.kind !== 'fragment') {
          return (
            <Markdown key={index} urlTransform={urlTransform}>{block.text}</Markdown>
          );
        }
        const { id: fragmentId, weight, topics, body } = block.fragment;
        const isRevealed = showAllFrags || revealed.has(fragmentId);
        const toggleLabel = `${isRevealed ? 'Hide' : 'Show'} details for this part`;
        const content = <Markdown urlTransform={urlTransform}>{body}</Markdown>;
        return (
          <section
            id={fragmentId}
            key={fragmentId}
            className={`lib-frag lib-frag--${weight}${revealed.has(fragmentId) ? ' is-revealed' : ''}`}
          >
            <button
              type="button"
              className="lib-frag__toggle"
              aria-expanded={isRevealed}
              aria-controls={fragmentId}
              aria-label={toggleLabel}
              title={toggleLabel}
              onClick={() => toggleFragment(fragmentId)}
            >
              {TAG_ICON}
            </button>
            <div className="lib-frag__meta">
              <span className="lib-frag__weight">{WEIGHT_LABELS[weight]}</span>
              {topics.map((topic) => (
                <span key={topic} className="lib-frag__topic">{topic}</span>
              ))}
              <a
                className="lib-frag__id"
                href={`#${fragmentId}`}
                title="Link to this part"
                // A bare #hash would be read as a route by the hash router; scroll instead.
                onClick={(event) => {
                  event.preventDefault();
                  window.document.getElementById(fragmentId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                #{fragmentId}
              </a>
            </div>
            {fragmentId === frag ? (
              <div className={`lib-doc-block${highlighted ? ' is-match' : ''}`}>{content}</div>
            ) : (
              content
            )}
          </section>
        );
      })}
    </article>
  );
}

