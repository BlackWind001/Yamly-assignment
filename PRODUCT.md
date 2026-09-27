# Yamly product behaviour

A record of behaviour a person using the app should know about. Implementation details do not belong here.

## Pages

- **Home** (`#/`) lists every document in the GreenCart docket and is the starting place to open them.
- **Search** (`#/search`) exists as a route. It currently shows only the page name.
- **Document** (`#/document/{id}`) shows one docket file.

## Documents

- `{id}` is the file name without its extension. Example: `01-welcome-to-greencart` opens `01-welcome-to-greencart.md`.
- Files come from `GreenCartArtifacts/greencart-docket/docs/`.
- If no file matches the id, the page says the document was not found.
- Matching files are rendered as Markdown (headings, lists, links), not as raw text.
- Markdown links that point at another `.md` file in the docket are treated as that document’s id.

## Tabs and panes

- The workspace is a tabbed, dockable layout. Several pages can be open at once.
- A normal click on a document link opens it as a tab (or focuses it if it is already open).
- Opening a document that is already open never creates a second copy. The existing tab becomes active.
- **⌘-click** (Mac) or **Ctrl-click** (Windows/Linux) on a link opens that page in a **new pane to the right** of the current one, if it is not already open. If it is already open, the existing tab is focused instead.
- The app does not open new OS windows. ⌘-click / Ctrl-click will not spawn a browser or Electron window.
- Tabs can be dragged to reorder, split into panes, or closed using the tab UI.
- When many tabs are open in one pane, the tab headers **wrap onto extra rows** instead of scrolling sideways.
- Closing the last remaining tab returns you to Home.

## URL

- The URL is the **focused** tab only (`#/`, `#/search`, or `#/document/{id}`).
- Other open tabs stay in memory for the session. They are not written into the URL.
- Changing the focused tab (clicking a tab, opening a link, or using the URL) updates the address bar to match.
- Reloading or launching the app with a document URL opens that document as the first tab.

## Temporary

- Home’s list of document links is a temporary way to reach documents until search and other navigation are built.
