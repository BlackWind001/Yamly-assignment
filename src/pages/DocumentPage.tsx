import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function DocumentPage() {
  const { id } = useParams();
  const [found, setFound] = useState<boolean | null>(null);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setFound(false);
      setContent(null);
      return;
    }

    window.electronAPI.readDocument(id).then((result) => {
      setFound(result.found);
      setContent(result.content);
    });
  }, [id]);

  if (found === null) {
    return <p>Loading...</p>;
  }

  if (!found) {
    return <h1>Document not found</h1>;
  }

  return (
    <div>
      <h1>Document {id}</h1>
      <pre>{content}</pre>
    </div>
  );
}
