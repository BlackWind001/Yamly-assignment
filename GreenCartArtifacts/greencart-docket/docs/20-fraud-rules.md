---
title: Fraud rules — the short version teams actually need
author: Kiran Joshi (Finance) with the fraud team
last_updated: 2026-04-02
status: active
original_format: docx
---

# Fraud rules — the short version teams actually need

The fraud team keeps detailed internal models. This page is the small set of rules other teams must know because their features touch them.

<!-- frag: cod-first-limit | weight: helpful | topics: fraud, cod -->
**Cash on delivery is capped at ₹1,500 for a customer's first order.** First-time COD is our single largest source of loss — fake addresses, refused deliveries, prank orders — and the cap keeps the worst of it small. The cap lifts automatically after one successfully delivered COD or any successful prepaid order. Checkout must show the cap gracefully (offer UPI/card for the amount above), not as an error.
<!-- /frag -->

<!-- frag: fraud-saved-card-review | weight: critical | topics: fraud, saved-cards -->
**A saved card used from a new device for an order above ₹2,000 goes to review before capture.** This rule was agreed back when saved cards were first planned in 2024 and it stands ready for whenever they ship: the combination "stored payment method + unfamiliar device + high value" is the classic account-takeover shape. Review is fast (minutes, automated checks first), but the order shows "confirming payment" rather than "confirmed" until it clears — any saved-cards checkout flow must design for this intermediate state instead of pretending capture is instant.
<!-- /frag -->

Refunds above ₹500 needing fraud approval is covered in the [refunds policy](04-refunds-policy.md). If you are building anything that moves money and you are unsure whether a fraud rule applies, ask the fraud channel before shipping, not after.
