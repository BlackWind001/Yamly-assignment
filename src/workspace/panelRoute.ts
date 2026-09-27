export type PanelDescriptor = {
  id: string;
  component: 'home' | 'search' | 'document';
  title: string;
  params?: { id: string };
};

export function pathToPanel(path: string): PanelDescriptor {
  if (path === '/search') {
    return { id: 'search', component: 'search', title: 'Search' };
  }

  const match = path.match(/^\/document\/([^/]+)$/);
  if (match) {
    return {
      id: `document:${match[1]}`,
      component: 'document',
      title: match[1],
      params: { id: match[1] },
    };
  }

  return { id: 'home', component: 'home', title: 'Home' };
}

export function hrefToPath(href: string | null): string | null {
  if (!href) {
    return null;
  }

  const withoutHash = href.includes('#') ? href.slice(href.indexOf('#') + 1) : href;
  const pathOnly = withoutHash.split('?')[0];

  if (pathOnly === '' || pathOnly === '/') {
    return '/';
  }

  if (pathOnly === '/search' || /^\/document\/[^/]+$/.test(pathOnly)) {
    return pathOnly;
  }

  const markdown = pathOnly.match(/([^/]+)\.md$/);
  if (markdown) {
    return `/document/${markdown[1]}`;
  }

  return null;
}

export function panelToPath(panelId: string): string {
  if (panelId === 'search') {
    return '/search';
  }

  if (panelId.startsWith('document:')) {
    return `/document/${panelId.slice('document:'.length)}`;
  }

  return '/';
}
