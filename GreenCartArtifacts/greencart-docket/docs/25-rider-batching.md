---
title: Rider batching — how orders share a rider
author: Arjun Gupta (Rider Operations)
last_updated: 2026-02-12
status: active
original_format: md
---

# Rider batching — how orders share a rider

Delivery cost is mostly rider time. Batching — one rider carrying several orders — is our main lever on it, and also the fastest way to break the delivery promise if done greedily. This document is the current rules and the reasoning.

<!-- frag: batch-max-3 | weight: helpful | topics: delivery, batching -->
**A rider carries at most 3 orders at once.** We tested 4 in Pune in 2024: bag space ran out with weighed produce, the third and fourth drops were reliably late, and rider complaints spiked. Three is not a tuning parameter to quietly raise; it is a tested ceiling, and raising it means redoing that test, not editing a config.
<!-- /frag -->

<!-- frag: batch-90min-assumption | weight: critical | topics: delivery, batching, promise -->
**All batching math assumes the 90-minute internal plan, not the two-hour promise.** Orders are batched only if every order in the batch can still hit its own 90-minute plan including the added drops — the [delivery time budget](07-delivery-promise.md) explains why the plan, not the promise, is the constraint. This is the load-bearing assumption of the whole batching system: if the plan window ever changed (say, a wider delivery window in some city), the batching logic doesn't adapt by itself — its core constants assume 90 minutes, and it would need deliberate rework, not just a new config value. Anyone evaluating window changes must budget for this.
<!-- /frag -->

Batches are formed at pick-completion time, not at order time — you cannot batch what a store might still reject ([five-minute window](21-store-agreement-summary.md)). Orders in a batch must come from the same store or stores within 500 meters, and drop points within a tight radius; the router decides drop order.

**Rain mode:** during heavy rain (ops toggle, per city), batching drops to max 2 orders and the customer app quietly shows "may take longer" while the internal plan gets a 15-minute extension from the buffer. Rain mode exists because the buffer is exactly for this — see the time budget doc — and turning it on early is always better than being late.
