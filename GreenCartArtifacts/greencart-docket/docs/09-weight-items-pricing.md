---
title: Weighed items — why the price is only final at the scale
author: Meera Kulkarni (Senior Engineer — no longer at GreenCart)
last_updated: 2024-06-14
status: active
original_format: txt
---

# Weighed items — why the price is only final at the scale

Vegetables, fruits, and some loose grains are sold by weight. A customer orders "about 500g," a picker picks real tomatoes, and real tomatoes never weigh exactly 500g.

<!-- frag: weight-final-at-scale | weight: helpful | topics: weight-items, payments -->
So for any weighed item, the checkout price is an **estimate**, and the true price exists only after the picker weighs the pick. Everything downstream is built around this: card orders hold 120% of the estimate and charge the true amount later; UPI orders charge the estimate upfront and give the difference back as instant credits (automatic under ₹100). If you are building anything that shows a price for a weighed item before weighing, label it as an estimate — showing it as final creates support tickets that all say the same thing: "you charged me a different amount."
<!-- /frag -->

Details of the money flows live in [payments](03-payments-design.md); the credit rules live in [refunds](04-refunds-policy.md).
