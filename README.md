# Yamly

A desktop app that hands you the few parts of a document pile that matter for the task in front of you. The pile is the GreenCart docket (`GreenCartArtifacts/greencart-docket`): 30 documents and 4 telemetry files. Which parts matter is already answered in `tasks.json`. The app's job is what you see and touch.

Features are grouped by the job they do. The note under each one is the experience it gives, and which requirement that experience covers. Theme and the clear button are ordinary interface work; they are marked that way.

## Setup

Requires Node.js 22 and npm.

```sh
npm install
npm run dev
```

`npm run dev` starts Vite on port 5173 and opens the Electron window.

Production:

```sh
npm run build
npm start
```

## Features

### The few parts, for this task

#### Task search

You type what you are doing and press Enter. `1`, `2`, or `3` picks a task by number. A task's own title matches exactly. Anything else matches on shared keywords. A query that shares no keywords still returns one of the three, and the same query always returns the same one.

> **Why.** You name the work in front of you and the list becomes the parts that belong to it. A payments task and a delivery task each get their own set. *The few parts that matter for what you are doing right now.*

| Query | Task | Telemetry |
| --- | --- | --- |
| `1`, `saved cards` | Bring back saved cards at checkout | payment failures |
| `2`, `Indore` | Evaluate a wider delivery window for Indore | delivery lateness |
| `3`, `substitutions` | Make substitution suggestions automatic and smarter | stock and substitutions, refunds |

> **[screenshot: search-home]** The prompt, before a query.

#### Passages

Results are the tagged passages for that task, with a count such as "12 passages related to …".

> **Why.** You pick from the passages that matter for this task, and the count shows how small that set is, so you start from the part itself. *The few parts inside the document.*

> **[screenshot: search-results]** Results for a task: telemetry tiles, then passages with the match highlighted.

### Where the part came from

#### Breadcrumb

Under each passage: the document title, then the section headings above that passage.

> **Why.** You can see which document and which section a passage came from while you are still in the list, which is enough to trust the excerpt or to go open it. The line stays short, so the list itself stays easy to scan. *Where a part came from, without clutter.*

### A sentence, a paragraph, and a chart

#### Two snippet shapes

A sentence match highlights that sentence, with a short run-up. A paragraph match shows the paragraph from the start, with no sentence highlight. Both are plain text, in the same kind of row.

> **Why.** A one-line rule and a full paragraph both show up as the same kind of result. The highlight marks the sentence that matters; a paragraph result is the whole paragraph, so nothing inside it is marked. *A sentence and a paragraph, the same calm way.*

#### Telemetry tiles

Charts for the task sit above the passages: a small preview, the chart's name, and how many more charts the file holds. Opening one uses the same pane as a document.

> **Why.** The numbers that matter for this task appear in the same list as the passages, and open in the same pane. A chart is something you can scan and then step into, the way you would a paragraph. *A live chart, the same calm way.*

### Into the document, and back

#### The document opens beside the results

Search stays on screen.

> **Why.** When the excerpt is too thin, you open the full document and the list you were choosing from stays on screen, so looking around keeps your place. *Into the full story, and back.*

#### It lands on the part

The matched passage scrolls into view and is highlighted. The highlight fades after a few seconds.

> **Why.** The document opens already on the passage you chose, so you can read the context around it immediately. The highlight fades, and the page is left as something to read. *Land on that part, in its original place.*

> **[screenshot: document]** A document open beside search, matched passage highlighted.

#### Close

The pane closes. The query and the results are still there.

> **Why.** You close the document and the same results are waiting, on the same query, ready for the next passage. *Back, without losing your spot.*

#### Links stay in the app

A link to another file in the pile opens that document here.

> **Why.** Following a reference opens the other document beside the same results, so checking where a claim came from is the same trip in and back. *Go and check the source.*

### Whether to trust it

#### On the result

The updated date, and a Stale or Abandoned label when the source document is one of those.

> **Why.** While you are still scanning, you can see that a passage is old or comes from an abandoned document, and decide whether to lean on it before you open the file. *Trust, in about a second.*

#### On the document

Status (Active, Stale, or Abandoned), the date and how long ago, the original format (Markdown, or carried over from .docx, .pdf, or .txt), and the author with their role.

> **Why.** At the top of the page you can see who wrote it, how long ago, whether it is still active, and whether it was carried over from another format, and decide from that whether to rely on the page. *Who, when, and whether it is still true.*

#### On a chart

The telemetry view says why the file is attached to this search, what to look at, and the idea behind the chart. Under the charts, the raw tables.

> **Why.** Beside the chart you can read why these numbers belong to your search and which figure to look at, then open the raw table when the chart is not the whole story. *The same trust check for a live chart, and a way further in.*

> **[screenshot: telemetry]** A telemetry file open, with its charts and the note on why it is attached.

### Calm when you are just reading

#### Fragment notes, in the margin

Each tagged passage carries a weight (Critical, Helpful, Background), its topics, and a link to that part. They sit in the left margin. Hover a passage to see them, or turn them all on from the toolbar.

> **Why.** You can see how much a passage matters, and jump to a pointer for it, only when you ask: on hover, or with the tags turned on. Critical is the part you cannot afford to miss. Background is the part you can skip. The column you are reading stays text. *Cues there when they matter, and out of the way while you read.*

> **[screenshot: fragment-tags]** The same document with fragment tags visible.

#### Reading mode

Hides the search pane and the theme toggle, and the document fills the window. Leaving it returns you to the split view, on the same document.

> **Why.** With the search and the controls gone, the window is just the document, as direct as reading a text file. Leaving reading mode puts you back on the same page, with the tools beside it again. *Reading straight through feels like a plain document.*

> **[screenshot: reading-mode]** Reading mode, search pane hidden.

### Basic UX

#### Theme

Light or dark, starting from the system setting. The toggle sits at the bottom left, and hides in reading mode so that page stays plain.

> **What it is.** UX delight. The page follows the light or dark of the room you are working in.

> **[screenshot: dark]** Any of the screens above, in dark theme.

#### Clear search

Clears the field and puts the cursor back.

> **What it is.** A basic UX control.

## How to test

In the app, with `npm run dev`:

1. Confirm the empty search prompt.
2. Search `saved cards` (or `1`). Confirm a passage count, highlighted snippets, breadcrumbs, and a payment-failures tile.
3. Open a passage. Confirm it scrolls to the match and the highlight fades. Open the saved-cards PRD from these results and confirm the Abandoned label, the author, and how long ago it was updated.
4. Hover a passage for its fragment note, then turn fragment tags on. Enter reading mode, then leave it and close the document. Confirm the results are still there.
5. Open the telemetry tile. Confirm the charts, the data table, and the note on why the file is attached.
6. Repeat the passage and telemetry steps for `Indore` and `substitutions`. On substitutions, open Meera's notes and confirm the Stale label.
7. Search `nope`. Confirm you still get one of the three tasks.
8. Toggle the theme, then clear the search field.

Three check scripts cover the data behind the UI. Each exits 0 when it passes. They check that every task fragment is a real passage, that the queries above (and a few misses) map to the right task, that all 30 documents parse, and that every chart builds from its JSON file.

```sh
node --experimental-strip-types src/search/getMockAnswer.check.ts
node --experimental-strip-types src/document/parseDocument.check.ts
node --experimental-strip-types src/telemetry/charts.check.ts
```
