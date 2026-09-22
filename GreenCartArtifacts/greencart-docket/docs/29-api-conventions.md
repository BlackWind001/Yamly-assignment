---
title: API and data conventions — the boring rules that prevent weird bugs
author: Meera Kulkarni (Senior Engineer — no longer at GreenCart)
last_updated: 2024-10-01
status: active
original_format: md
---

# API and data conventions — the boring rules

Three conventions, followed everywhere, each one earned.

<!-- frag: utc-backend | weight: background | topics: data, time -->
**All backend timestamps are UTC.** Apps and dashboards convert to IST at display time and nowhere earlier. India's offset is +5:30 — the half hour, not the five hours, is what causes the subtle bugs, especially "daily" boundaries (a midnight-UTC day cut is 5:30 am IST — see the war story in [Meera's notes](24-meera-notes.md)). If a stored time looks 5-and-a-bit hours off, nothing is wrong; if a *report* looks slightly off, check which midnight it used.
<!-- /frag -->

**All money is integer paise** — the full reasoning is one page: [price storage note](11-price-storage-note.md). Convert at system boundaries, never inside.

**All IDs are strings, even when they look numeric.** Store item codes, attempt IDs, listing UIDs — strings. Numeric ID types invite arithmetic, arithmetic invites sorting and "next ID" logic, and both break the moment an upstream system sends `0042` or reuses a code ([item IDs warning](10-item-ids-warning.md)). Strings keep IDs as names, which is all they are.
