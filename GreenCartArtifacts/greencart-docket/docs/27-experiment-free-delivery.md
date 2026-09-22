---
title: "Experiment result: the free-delivery threshold (₹399 vs ₹499)"
author: Vikram Bhat (Data Analyst)
last_updated: 2025-05-30
status: active
original_format: md
---

# Experiment result: the free-delivery threshold

Six-week test, Pune and Jaipur, spring 2025. Half of customers saw free delivery above ₹399, half above ₹499. Question: does the lower threshold pay for itself through more and bigger orders?

<!-- frag: exp-499-threshold | weight: background | topics: pricing, experiments -->
**Result: ₹499 won, clearly.** The ₹399 group ordered slightly more often, but average baskets shrank — people trimmed carts to just clear the lower bar — and the delivery fees we gave up were larger than the extra margin from added orders. Net contribution was meaningfully negative for ₹399. The interesting behavioral bit: at ₹499, customers add items to reach the bar (basket grows); at ₹399 they mostly already qualify and trim. **The threshold stays at ₹499**, and the next time someone proposes lowering it as a growth lever, this experiment is the starting point — rerun it if the world has changed, but don't re-argue it from feelings.
<!-- /frag -->

Method notes: split by customer ID, new customers included, festival weeks excluded from the read. Full query set archived in the analytics repo under `exp-fd-threshold-2025`.
