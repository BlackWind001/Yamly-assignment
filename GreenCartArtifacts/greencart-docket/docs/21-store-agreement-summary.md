---
title: Partner store agreement — plain-words summary
author: External counsel summary, maintained by Anita Rao
last_updated: 2025-07-15
status: active
original_format: pdf
---

# Partner store agreement — plain-words summary

The real agreement is a legal document held by finance. This is the plain-words summary of the parts teams ask about. When exact wording matters, ask for the real agreement; this summary is honest but not the contract.

## Commercials, briefly

Stores are paid weekly for goods sold through GreenCart, at the store's own shelf price minus our agreed margin. Stores keep ownership of stock until picked. Payment disputes go through a monthly reconciliation both sides sign off on.

## Our people in their stores

GreenCart pickers work inside partner stores under the store's house rules (hours, conduct, storage areas). Stores provide reasonable access to shelves and a packing spot near billing. Pickers use only GreenCart handhelds — store billing terminals are off-limits to us, and their billing data reaches us only through the agreed sync (the 30-minute stock feed described in the [data dictionary](18-data-dictionary.md)).

## The operational clause everyone actually cares about

<!-- frag: store-reject-5min | weight: helpful | topics: delivery, contract -->
**A store may reject any incoming order within five minutes of receiving it, for any reason, without penalty.** After five minutes of silence the order is contractually treated as accepted and the store is expected to fulfil it. This window is in the signed agreement with every partner store; we cannot shorten it product-side, and the [delivery time budget](07-delivery-promise.md) permanently sets aside those five minutes. Any feature that assumes an order is real the instant it is placed — instant rider dispatch, instant "preparing your order" messaging — is writing a check the contract lets stores bounce.
<!-- /frag -->

## Ending the relationship

Either side can exit with 30 days' notice. Store-initiated exits mostly happen when a store changes owners; the catalog stays keyed by `listing_uid`, so history survives a store leaving ([item IDs warning](10-item-ids-warning.md) explains why that matters).
