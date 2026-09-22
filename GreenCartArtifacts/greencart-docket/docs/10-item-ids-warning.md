---
title: "Warning: store item IDs get reused. Use listing_uid."
author: Meera Kulkarni (Senior Engineer — no longer at GreenCart)
last_updated: 2023-09-30
status: active
original_format: md
---

# Warning: store item IDs get reused. Use listing_uid.

This note exists because we learned it the embarrassing way.

<!-- frag: listing-uid-rule | weight: critical | topics: data, catalog -->
Store billing systems reuse item codes. When a store deletes an item, its code goes back into the pool, and next month the same code can mean a completely different product. In 2023, code 40213 at one Pune store was a shampoo; after a catalog cleanup it became a cooking oil, and our reports happily showed shampoo sales turning into oil sales overnight. The rule since then: **inside GreenCart, never use the store's item code as an identity.** Every product listing gets our own permanent `listing_uid` the first time we see it, and that is the only ID that history, reports, substitution mappings, and telemetry may key on. The store's code is just a lookup detail that can change under us.
<!-- /frag -->

Where `listing_uid` lives and how it maps to store codes is in the [data dictionary](18-data-dictionary.md). If you are matching "the same product" across time or across stores — substitution logic does exactly this — this note is the difference between working and quietly wrong.
