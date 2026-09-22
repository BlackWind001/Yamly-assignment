---
title: Why there are two order tables (history, and a warning)
author: Meera Kulkarni (Senior Engineer — no longer at GreenCart)
last_updated: 2023-11-05
status: active
original_format: md
---

# Why there are two order tables

New engineers find `orders` and `orders_v1` and reasonably ask which is real. Both are — for different years.

`orders_v1` is from the original 2021 build, when GreenCart was cash-on-delivery only and an order was one row with five columns of ambition. The 2023 rewrite introduced the current `orders` table with a proper state machine and per-state timestamps. Migrating three years of finished history into the new shape was judged all risk and no reward, so old rows stayed where they were.

<!-- frag: never-write-v1 | weight: helpful | topics: data, legacy -->
The standing rule: **`orders_v1` is read-only forever. Nothing writes to it, no exceptions, but it cannot be dropped yet** because the monthly finance close still reads it for pre-2023 history (planned to end after FY26, then the table can finally go). About once a year someone wires a report or a backfill to the wrong table, and finance numbers for April mysteriously double — this happens often enough that it is a running joke in [Meera's notes](24-meera-notes.md). If you are touching order history and your date range crosses mid-2023, you need both tables and you need to be sure which one you are writing to: the answer must always be "only the new one."
<!-- /frag -->
