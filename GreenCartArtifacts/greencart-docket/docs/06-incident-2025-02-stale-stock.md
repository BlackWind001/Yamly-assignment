---
title: "Incident report: the stale stock day in Indore (Feb 2025)"
author: Anita Rao (Head of Operations)
last_updated: 2025-02-27
status: active
original_format: md
---

# Incident report: the stale stock day in Indore

**Date of incident:** 21 February 2025, most of the day
**Impact:** Around 2,900 Indore orders contained at least one item that was not actually on the shelf. Cancellation rate tripled for the day. Indore had launched only weeks earlier, so this was many customers' first impression of us.

## What happened, in plain words

Our stock numbers come from each store's own billing system, synced every 30 minutes. In Indore, most stores run a billing system we hadn't integrated with before. Its overnight update changed a field name; our sync job didn't fail — it kept running and kept writing **yesterday's numbers** with today's timestamp. To every dashboard, stock looked fresh. It was a day old.

Customers ordered items that had sold out overnight. Pickers reached empty shelves. Because Indore was new, our substitution catalog there was thin, so instead of offering a swap, we cancelled.

## Why this was really a design lesson, not just a bug

<!-- frag: incident-stock-lesson | weight: helpful | topics: stock, substitutions -->
The deep lesson was not "validate the field name" (though we do now). It was this: **stock data can fail while looking healthy, so the product must degrade gracefully when stock is wrong.** The shelf is the truth; the database is a hint. After this incident we stopped treating substitution as a nice-to-have and made it a core flow — a picker at an empty shelf should always have a good next move that isn't cancellation. That thinking shaped the current [substitution spec](08-substitutions-spec.md).
<!-- /frag -->

## Follow-ups completed

Sync job now alerts if the incoming numbers are identical to the previous run for more than 2 hours (done, Mar 2025). Substitution catalog seeded for all Indore stores (done, Apr 2025). "Freshness" timestamp shown to pickers in their app so they know how old a stock claim is (done, May 2025).
