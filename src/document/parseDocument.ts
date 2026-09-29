export type DocumentFrontmatter = {
  title?: string;
  author?: string;
  last_updated?: string;
  status?: 'active' | 'stale' | 'abandoned';
  abandoned_reason?: string;
  stale_reason?: string;
  original_format?: 'md' | 'docx' | 'pdf' | 'txt';
};

export type Fragment = {
  id: string;
  weight: 'critical' | 'helpful' | 'background';
  topics: string[];
  body: string;
};

export type DocumentBlock =
  | { kind: 'markdown'; text: string }
  | { kind: 'fragment'; fragment: Fragment };

export type ParsedDocument = {
  frontmatter: DocumentFrontmatter;
  fragments: Fragment[];
  blocks: DocumentBlock[];
};

const STATUSES = new Set<DocumentFrontmatter['status']>(['active', 'stale', 'abandoned']);
const FORMATS = new Set<DocumentFrontmatter['original_format']>(['md', 'docx', 'pdf', 'txt']);
const WEIGHTS = new Set<Fragment['weight']>(['critical', 'helpful', 'background']);

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const FRAG_RE =
  /<!--\s*frag:\s*([^|]+?)\s*\|\s*weight:\s*([^|]+?)\s*\|\s*topics:\s*([^>]*?)\s*-->([\s\S]*?)<!--\s*\/frag\s*-->/g;

function unquote(value: string): string {
  if (value.length >= 2 && value[0] === value.at(-1) && (value[0] === '"' || value[0] === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(raw: string): { frontmatter: DocumentFrontmatter; body: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter: DocumentFrontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!kv) {
      continue;
    }
    const value = unquote(kv[2].trim());
    if (!value) {
      continue;
    }
    switch (kv[1]) {
      case 'title':
      case 'author':
      case 'last_updated':
      case 'abandoned_reason':
      case 'stale_reason':
        frontmatter[kv[1]] = value;
        break;
      case 'status':
        if (STATUSES.has(value as DocumentFrontmatter['status'])) {
          frontmatter.status = value as DocumentFrontmatter['status'];
        }
        break;
      case 'original_format':
        if (FORMATS.has(value as DocumentFrontmatter['original_format'])) {
          frontmatter.original_format = value as DocumentFrontmatter['original_format'];
        }
        break;
    }
  }

  return { frontmatter, body: raw.slice(match[0].length) };
}

export function parseDocument(raw: string): ParsedDocument {
  const { frontmatter, body } = parseFrontmatter(raw);
  const fragments: Fragment[] = [];
  const blocks: DocumentBlock[] = [];
  let last = 0;

  for (const match of body.matchAll(FRAG_RE)) {
    const index = match.index ?? 0;
    const text = body.slice(last, index).trim();
    if (text) {
      blocks.push({ kind: 'markdown', text });
    }

    const weight = match[2].trim();
    if (WEIGHTS.has(weight as Fragment['weight'])) {
      const fragment: Fragment = {
        id: match[1].trim(),
        weight: weight as Fragment['weight'],
        topics: match[3].split(',').map((topic) => topic.trim()).filter(Boolean),
        body: match[4].trim(),
      };
      fragments.push(fragment);
      blocks.push({ kind: 'fragment', fragment });
    } else if (match[4].trim()) {
      blocks.push({ kind: 'markdown', text: match[4].trim() });
    }

    last = index + match[0].length;
  }

  const tail = body.slice(last).trim();
  if (tail) {
    blocks.push({ kind: 'markdown', text: tail });
  }

  return { frontmatter, fragments, blocks };
}

// Headings above a fragment, outermost first. Skips the level-1 title, which the doc title already shows.
export function sectionPath(blocks: DocumentBlock[], fragmentId: string): string[] {
  const path: { level: number; text: string }[] = [];
  for (const block of blocks) {
    if (block.kind === 'fragment' && block.fragment.id === fragmentId) {
      return path.map((heading) => heading.text);
    }
    const text = block.kind === 'markdown' ? block.text : block.fragment.body;
    for (const line of text.split(/\r?\n/)) {
      const heading = /^(#{2,6})\s+(.+?)\s*#*\s*$/.exec(line);
      if (!heading) {
        continue;
      }
      const level = heading[1].length;
      while (path.length && path.at(-1)!.level >= level) {
        path.pop();
      }
      path.push({ level, text: heading[2] });
    }
  }
  return [];
}
