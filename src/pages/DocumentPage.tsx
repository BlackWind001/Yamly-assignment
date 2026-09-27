import { useParams } from 'react-router-dom';

export function DocumentPage() {
  const { id } = useParams();

  return <h1>Document {id}</h1>;
}
