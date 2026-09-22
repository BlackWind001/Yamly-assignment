---
title: Data dictionary — the five tables everyone touches
author: Vikram Bhat (Data Analyst)
last_updated: 2026-06-15
status: active
original_format: md
---

# Data dictionary — the five tables everyone touches

Plain-words guide to the core tables. Not exhaustive; these five cover most questions new people ask.

## orders

One row per customer order since the 2023 rewrite. State machine lives in the `state` column: placed → accepted → picking → picked → out_for_delivery → delivered (or cancelled/rejected from several states). Timestamps for each state change. All times UTC — display layers convert to IST (see [API conventions](29-api-conventions.md)).

## orders_v1 (legacy — read-only)

<!-- frag: dd-orders-v1 | weight: helpful | topics: data, legacy -->
The original orders table from the 2021 cash-on-delivery era. **Nothing may write to it**, but it is not dead: the monthly finance job still reads it for pre-2023 history, so it cannot be dropped yet. The story of why two tables exist — and the April incident that happens when someone forgets — is in [why we have two order tables](23-why-two-order-tables.md). If your numbers for anything before mid-2023 look wrong, you probably forgot this table exists.
<!-- /frag -->

## listings

<!-- frag: dd-listings-uid | weight: helpful | topics: data, catalog -->
One row per product per store, keyed by our permanent **`listing_uid`**. The store's own item code is stored here as a plain column (`store_item_code`) that can change or be reused by the store at any time — it is a lookup detail, never an identity. Substitution mappings, sales history, and telemetry all key on `listing_uid`. The painful lesson behind this design is one page: [item IDs warning](10-item-ids-warning.md).
<!-- /frag -->

## stock_estimates

<!-- frag: dd-stock-estimates-30min | weight: critical | topics: data, stock -->
Per-listing stock numbers synced from each store's billing system roughly every **30 minutes**, with a `synced_at` timestamp on every row. Treat every number here as a **hint about the recent past, not a fact about the shelf** — walk-in shoppers empty shelves between syncs, and the sync itself can fail while looking healthy (that exact failure caused the [Indore stale-stock day](06-incident-2025-02-stale-stock.md)). Anything user-facing built on this table must degrade gracefully when it is wrong, because it will be wrong many times a day somewhere.
<!-- /frag -->

## payment_attempts

One row per payment attempt, keyed by `attempt_id`. Retries reuse the row's `attempt_id` (never a new one — [the incident](05-incident-2024-08-double-charge.md)). Columns for method, hold amount, captured amount, provider, state. Amounts in paise, like everything ([price note](11-price-storage-note.md)). The alert "more than one capture per attempt" reads this table.
