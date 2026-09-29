// Result snippets are plain text: document formatting (bold, links, code) would compete with the match highlight.
// ponytail: regex strip covers the inline Markdown these docs use; swap for remark's toString if richer markup appears.
export function plainText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|__|\*|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Splits text around the matched sentence. `lead` caps the text shown before it: sentence results keep a
// short run-up so the match stays inside their 3-line clamp; paragraph results pass Infinity to show it all.
export function sentenceSnippet(
  text: string,
  sentence: string,
  lead = 60,
): { before: string; match: string; after: string } | null {
  const at = text.indexOf(sentence);
  if (at < 0) {
    return null;
  }
  let before = text.slice(0, at);
  if (before.length > lead) {
    before = `…${before.slice(-lead).replace(/^\S*\s/, '')}`;
  }
  return { before, match: sentence, after: text.slice(at + sentence.length) };
}
