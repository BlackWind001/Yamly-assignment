---
title: Substitutions — what to offer when the shelf is empty
author: Rohit Menon (Product Manager)
last_updated: 2026-04-22
status: active
original_format: md
---

# Substitutions — what to offer when the shelf is empty

A picker is standing at an empty shelf. The customer wanted an item that isn't there. What happens in the next three minutes decides whether this order ends happily. This spec defines that.

Background reading: the shelf-is-truth reality is explained in [how an order works](02-how-an-order-works.md) and was burned into us by the [Indore stale-stock incident](06-incident-2025-02-stale-stock.md).

## The offer ladder

<!-- frag: sub-ladder | weight: critical | topics: substitutions -->
When an item is out, we offer substitutes in this strict order: first, the **same brand in a different size** (500g instead of 1kg — price adjusted); second, a **different brand of the same item, same size**; third, nothing — mark the item unavailable and move on. We never jump to a "similar" product of a different kind (no offering poha when someone ordered oats). The ladder exists because acceptance data shows people trust size-swaps far more than brand-swaps, and brand-swaps far more than kind-swaps, which they mostly refuse and resent.
<!-- /frag -->

## The lines we never cross

<!-- frag: sub-veg-nonveg | weight: critical | topics: substitutions, trust -->
**Never substitute across vegetarian and non-vegetarian. In either direction. Ever.** Not the same brand, not the same product in a different flavor, not "it's clearly better." A customer who ordered a veg item and received anything non-veg — or vice versa — does not complain and come back. They leave forever, and they tell people. This rule is absolute, it is not about price, and no experiment may relax it. The same hard line applies to baby food and to items marked as allergy-specific (gluten-free, nut-free): out of stock means unavailable, never swapped.
<!-- /frag -->

## Price rules

<!-- frag: sub-price-cap-110 | weight: critical | topics: substitutions, payments -->
A substitute may cost at most **110% of the original item's price**. On card orders the extra fits inside the 120% hold headroom (see [payments](03-payments-design.md)), so the customer pays the small difference naturally at capture.
<!-- /frag -->

<!-- frag: sub-upi-cheaper-only | weight: critical | topics: substitutions, payments -->
**UPI orders are stricter: a substitute must be equal or cheaper, never costlier.** A UPI customer was already charged the full estimate at checkout, and we cannot charge them again (see the [UPI rule in payments](03-payments-design.md)). Cheaper substitutes just mean a bigger automatic credit. This is the single most-missed rule when people build anything that proposes substitutes, because it means the substitute catalog is not the same for every order — it depends on how the order was paid.
<!-- /frag -->

## The customer gets three minutes

<!-- frag: sub-timer-3min | weight: helpful | topics: substitutions, delivery -->
When the picker proposes a substitute, the customer gets an app notification and **three minutes** to accept or decline. No answer means we apply their saved default (accept size-swaps automatically, decline brand-swaps — most customers keep this default). Three minutes is the most we can wait without breaking the 90-minute plan in the [delivery time budget](07-delivery-promise.md); do not extend it without reading that document.
<!-- /frag -->

## Weighed items

Substituting one weighed item for another (different tomatoes) re-enters the weighing flow — final price at the scale, per the [weight items note](09-weight-items-pricing.md). All the price rules above apply to the estimate.

## What we measure

Acceptance rate by category and swap type, in `stock-and-substitutions.json`. Vegetables get substituted the most; baby care sees the lowest acceptance by far, which supports the hard line above. The support team's view of what goes wrong is in the [support playbook](17-support-playbook-refunds.md) — wrong substitutes are their top complaint, which is exactly why the ladder is strict.
