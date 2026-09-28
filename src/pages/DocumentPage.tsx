import { useEffect, useState } from 'react';
import Markdown, { defaultUrlTransform } from 'react-markdown';
import { useParams } from 'react-router-dom';
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

export function DocumentPage() {
  const { id } = useParams();
  const [document, setDocument] = useState<DocumentState | null>(null);

  useEffect(() => {
    if (!id) {
      setDocument({ found: false });
      return;
    }

    let cancelled = false;
    setDocument(null);
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

  if (document === null) {
    return <p>Loading...</p>;
  }

  if (!document.found) {
    return <h1>Document not found</h1>;
  }

  return (
    <article className="lib-doc">
      <DocumentHeader frontmatter={document.frontmatter} />
      {withoutTitle(document.blocks, document.frontmatter.title).map((block, index) =>
        block.kind === 'fragment' ? (
          <div id={block.fragment.id} key={block.fragment.id}>
            <Markdown urlTransform={urlTransform}>{block.fragment.body}</Markdown>
          </div>
        ) : (
          <Markdown key={index} urlTransform={urlTransform}>{block.text}</Markdown>
        ),
      )}
    </article>
  );
}
