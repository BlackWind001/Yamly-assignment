---
title: Coupons — order of operations, and the trap
author: Rohit Menon (Product Manager)
last_updated: 2025-08-19
status: active
original_format: md
---

# Coupons — order of operations, and the trap

Coupons look simple and are not. This document is short on purpose: it exists mainly to protect one rule and warn about one trap.

## The order of operations

<!-- frag: coupon-order-of-ops | weight: helpful | topics: pricing, coupons -->
Checkout math runs strictly in this order: item subtotal → coupon discounts → free-delivery check → delivery fee (plus its tax, see the [tax note](26-tax-note.md)) → final total. Coupons apply **before** the delivery fee exists, so a coupon can never discount the delivery fee. Free-delivery offers are their own separate thing, never a coupon.
<!-- /frag -->

## The trap

<!-- frag: coupon-threshold-trap | weight: helpful | topics: pricing, coupons -->
Free delivery kicks in above **₹499** — but the threshold is checked **after coupons**, on the discounted subtotal. A ₹520 cart with a ₹50 coupon pays the delivery fee. Marketing assumes the opposite roughly once a year and plans a campaign where "every ₹500 cart ships free," and then support gets a wave of "why was I charged delivery" tickets. If you are building anything that predicts or displays the delivery fee, check the threshold against the post-coupon subtotal, and if you are reviewing a campaign, ask this question out loud.
<!-- /frag -->

Why the threshold is ₹499 and not ₹399 is not folklore — we tested it. See the [free delivery experiment](27-experiment-free-delivery.md).
