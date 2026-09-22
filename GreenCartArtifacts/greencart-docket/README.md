# The GreenCart Docket

A realistic, fully fictional company knowledge base, built as the working material to support an assignment: **build an interface that surfaces the few parts of a document pile that matter for the task at hand.**

Everything here — the company, the people, the incidents, the numbers — is invented, but invented carefully: the documents cross-reference each other, contradict each other in one deliberate place, go stale in realistic ways, and bury genuinely load-bearing knowledge inside ordinary-looking pages, exactly the way a real company's folder does.

## The company in one paragraph

**GreenCart** delivers groceries within two hours in three Indian cities (Pune, Jaipur, Indore). It owns no warehouses: its pickers work inside ~200 partner stores, picking, weighing, and packing orders that its riders deliver. Because the final price of weighed items (vegetables, fruit) is known only after weighing, and because store stock data is a 30-minute-old guess, most of GreenCart's engineering exists to keep a confident promise on top of uncertain inputs. That tension generates the tribal knowledge this docket is full of.

## What's in the box

```
greencart-docket/
  README.md                  <- you are here
  tasks.json                 <- three tasks, each mapped to its relevant fragments + telemetry
  docs/                      <- 30 markdown documents (see the map below)
  telemetry/                 <- 4 JSON files simulating live dashboards
```

### The 30 documents

Deliberately varied: long specs, one-page warnings, incident reports, fluffy business documents, meeting notes, one abandoned document, and one stale personal-notes file. Every document contains at least one tagged fragment.

Orientation and lifecycle: `01` welcome, `02` how an order works end to end.
Payments: `03` payments design (the current truth), `04` refunds policy, `05` double-charge incident, `09` weighed items, `11` paise note, `16` payment-failure runbook.
Delivery: `07` the two-hour time budget, `13` offsite notes on the 4-hour debate, `25` rider batching, `19` notification rules.
Stock and substitutions: `06` stale-stock incident, `08` substitution spec, `10` item-ID reuse warning, `18` data dictionary, `22` picker field notes.
Business and context: `14` Indore BRD (mostly fluff, three buried gems), `21` store agreement summary, `26` tax note, `27` free-delivery experiment, `30` roadmap.
People and trust: `15` **abandoned** saved-cards PRD (partly wrong on purpose), `24` **stale** notes from a departed engineer, `23` legacy order tables, `12` coupon rules, `17` support playbook, `20` fraud rules, `28` data access rules, `29` API conventions.

### Document metadata (frontmatter)

Every document opens with YAML frontmatter:

```yaml
---
title: ...
author: Dev Sharma (Payments Engineer)      # role included; some authors have left
last_updated: 2024-06-20                    # real spread from 2023 to 2026
status: active | stale | abandoned          # trust signal
abandoned_reason / stale_reason: ...        # present when status isn't active
original_format: md | docx | pdf | txt      # the format this doc pretends to be
---
```

All files are markdown for buildability; `original_format` preserves the story that real knowledge lives in mixed formats. `status`, `last_updated`, and the author's departure note are the raw material for the assignment's trust/credibility challenge.

### Fragment markers

Load-bearing parts of documents are wrapped in HTML comments (invisible when the markdown is rendered, trivial to parse):

```
<!-- frag: sub-veg-nonveg | weight: critical | topics: substitutions, trust -->
...one or more paragraphs...
<!-- /frag -->
```

`frag` is a unique ID, `weight` is the author's own sense of importance (critical / helpful / background), `topics` are loose labels. There are 60+ tagged fragments across the 30 documents.

### tasks.json

The assignment tells candidates: *you don't have to build the intelligence that decides what's relevant — fake it.* This file is that fake, ready-made. It defines three tasks. For each task it lists the fragments that matter (doc + frag ID + weight **for this task** + a one-line why) and the telemetry worth showing (file + which field + why + a chart idea).

1. **task-saved-cards** — bring back saved cards at checkout. The trap: the most detailed saved-cards document is abandoned and its storage approach is now forbidden; the current truth lives in the payments doc. Surfacing the stale doc *with* its warning is the heart of this task.
2. **task-4h-window-indore** — evaluate a wider delivery window for Indore. The trap: this debate already happened and was decided; and the batching system silently hard-assumes the 90-minute plan. The task rewards surfacing rationale and intent, not just facts.
3. **task-auto-substitution** — make substitute suggestions automatic. The trap: two payment rules (UPI cheaper-only; the 110%/120% interplay) and one cultural absolute (never across veg/non-veg) constrain the feature from documents nobody would think to open.

Note the same fragment can carry different weight per task — weights in `tasks.json` are task-relative and can differ from the author's weight in the marker. That difference is intentional: relevance depends on the task, which is the whole premise.

### telemetry/ — the parts that aren't text

Four JSON files simulating live dashboards (payment failures, delivery lateness, stock & substitutions, refunds). These exist so the docket contains relevant "parts" that are **not prose** — a surfaced part might be a chart with numbers behind it, and the interface has to present that as calmly as it presents a paragraph. Each task in `tasks.json` points at the specific fields that matter and suggests a chart.

## How the pieces stitch together

Follow one thread to see that the coherence is real, not decorative. Take **task-saved-cards**: the roadmap (`30`) names saved cards as Bet 1 and points at payments (`03`). Payments states today's hard rule — provider tokens only — and explicitly warns about the abandoned PRD (`15`). The PRD, marked abandoned in its own frontmatter, contains one fragment that is now *wrong* (self-storage of card numbers) and one that is still *valuable* (the checkout UX research) — trust is per-fragment, not per-document, which is the assignment's sharpest point. The fraud rules (`20`) contain a review rule that outlived the dead PRD that created it. The retry rule in payments cites the double-charge incident (`05`), which the runbook (`16`) also enforces. And the telemetry (`payment-failures.json`) carries the quantitative case: 9.1% typed-card failure vs 2.8% for saved tokens. Six documents plus one dashboard, none of which individually "is" the answer.

The same is true of the other two tasks (the delivery thread runs `30 → 13 → 07 → 25 → 14 → delivery-lateness.json`; the substitution thread runs `08 → 22 → 10 → 03 → 06 → stock-and-substitutions.json`). Every cross-reference in every document is a real relative link that resolves.

## Deliberate design choices

**The fluff is on purpose.** The Indore BRD is mostly market context with three load-bearing fragments buried near the end — because that is what BRDs are like, and "most of the document doesn't matter" is the premise being tested.

**The contradiction is on purpose.** Exactly one pair of documents disagrees (`03` vs `15`), and the current one names the stale one. An interface that shows both, with their status, teaches the user something no search result can.

**The staleness is graded.** `15` is abandoned (actively wrong in one place). `24` is stale (accurate when written, unowned now). Several active documents simply have old `last_updated` dates or departed authors. Trust is a spectrum here, not a boolean.

**Numbers are globally consistent.** ₹499 free-delivery threshold, ₹100 auto-credit, ₹500 fraud approval, ₹1,500 first-COD cap, ₹2,000 saved-card review, 120% hold, 110% substitute cap, 5-minute store window, 90-minute plan, 30-minute stock sync, 3-minute customer timer, max 3 orders per rider, 10pm–8am quiet hours. Any of these appearing in two documents appears with the same value.

**The language is deliberately simple.** No domain background needed; a reader who has never worked in commerce or payments should understand every document. Terms of art (hold/authorization, capture) are introduced in plain words where first used.

## Using it

**For a human candidate:** read `tasks.json`, pick a task, and build the interface the assignment describes. Parsing frontmatter + fragment markers + `tasks.json` gives you everything: content, importance, task-relevance, trust signals, sources, and chart data — no backend needed.

**For an AI / coding agent of the candidate:** the docket is fully machine-readable. Frontmatter is YAML; fragments are regex-friendly (`<!-- frag: ID | weight: W | topics: T -->` … `<!-- /frag -->`); `tasks.json` is the ground-truth relevance mapping; all doc-to-doc links are relative markdown links within `docs/`.