# Yamly product behaviour

A record of behaviour a person using the app should know about. Implementation details do not belong here.

## Pages

- **Home** (`#/`) lists every document in the GreenCart docket and is the starting place to open them.
- **Search** (`#/search`) is reserved. It does not open a tab yet; the left pane still shows Home.
- **Document** (`#/document/{id}`) shows one docket file.

## Layout

- The **left pane** is a fixed view. It is always Home for now. It cannot be closed, docked, or turned into a tab. When the right pane is open, drag the divider to resize the left pane.
- The **right pane** holds document tabs. Documents never open on the left.
- When no document tabs are open, the right pane is gone and Home uses the full window.
- Opening a document creates the right pane if it is not already there.

## Documents

- `{id}` is the file name without its extension. Example: `01-welcome-to-greencart` opens `01-welcome-to-greencart.md`.
- Files come from `GreenCartArtifacts/greencart-docket/docs/`.
- If no file matches the id, the page says the document was not found.
- Matching files are rendered as Markdown (headings, lists, links), not as raw text.
- Markdown links that point at another `.md` file in the docket are treated as that document’s id.

## Tabs and panes

- A normal click on a document link opens it as a tab on the right (or focuses it if it is already open).
- Opening a document that is already open never creates a second copy. The existing tab becomes active.
- **⌘-click** (Mac) or **Ctrl-click** (Windows/Linux) on a document link opens it in a **new pane to the right** of the current document pane, if it is not already open. If no document pane exists yet, the first document just opens the right pane. If it is already open, the existing tab is focused instead.
- The app does not open new OS windows. ⌘-click / Ctrl-click will not spawn a browser or Electron window.
- Tabs on the right can be dragged to reorder, split into more panes, or closed using the tab UI.
- When many tabs are open in one pane, the tab headers **wrap onto extra rows** instead of scrolling sideways.
- Closing the last document tab closes the right pane. Home fills the window again.

## URL

- The URL is the **focused document tab** (`#/document/{id}`), or `#/` when no document is open on the right.
- Other open document tabs stay in memory for the session. They are not written into the URL.
- Changing the focused tab (clicking a tab, opening a link, or using the URL) updates the address bar to match.
- Reloading or launching the app with a document URL shows Home on the left and that document on the right.
- Navigating to `#/` while documents are open closes the right pane.

## Temporary

- Home’s list of document links is a temporary way to reach documents until search and other navigation are built.
- The left pane will later host Search (or another view) in place of Home. Document tabs stay on the right.
