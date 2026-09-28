import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import { parseDocument, type ParsedDocument } from '../document/parseDocument';

type DocumentState = ({ found: true } & ParsedDocument) | { found: false };

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
      {document.blocks.map((block, index) =>
        block.kind === 'fragment' ? (
          <div id={block.fragment.id} key={block.fragment.id}>
            <Markdown>{block.fragment.body}</Markdown>
          </div>
        ) : (
          <Markdown key={index}>{block.text}</Markdown>
        ),
      )}
    </article>
  );
}
