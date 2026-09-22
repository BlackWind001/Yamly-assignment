---
title: Payments — how money actually moves
author: Dev Sharma (Payments Engineer)
last_updated: 2026-03-18
status: active
original_format: md
---

# Payments — how money actually moves

This is the current, true description of GreenCart payments. If an older document disagrees with this one, this one wins. (Yes, there is an older document that disagrees. See the note on saved cards near the end.)

## What customers pay with

Roughly: UPI about 60% of orders, cards about 25%, cash on delivery about 15%. Our payment provider is **PayOrbit**. We keep a backup provider, **Cashlane**, for UPI only — see the [payment failure runbook](16-runbook-payment-failure-spike.md) for when and how we switch.

## The core problem: we don't know the final price at checkout

Because of weighed items (vegetables, fruits), the final bill is only known after the picker weighs the items — after checkout. So "pay at checkout" cannot mean "charge the exact amount at checkout." We solve it differently per method.

### Cards: hold now, charge later

<!-- frag: pay-capture-timing | weight: critical | topics: payments -->
On card orders we never charge at checkout. We place a **hold** on the card (the banking word is "authorization") and we only actually take the money ("capture") after picking and weighing are complete, for the real final amount. If the store rejects the order or we cancel, we release the hold and no money ever moved. Do not change this order of events. Charging before pick-complete is how you create refunds, and refunds are our most expensive and most trust-damaging operation.
<!-- /frag -->

<!-- frag: pay-hold-120 | weight: critical | topics: payments, weight-items -->
The hold amount is **120% of the cart estimate** whenever the cart contains weighed items (100% if it doesn't). The 20% headroom covers weight coming in higher than the estimate and small price differences on substitutes. The capture must always be less than or equal to the hold; if a capture would exceed the hold, something upstream broke the rules — fail the capture and page payments, do not "just charge the difference" as a second charge.
<!-- /frag -->

### UPI: charge now, give back later

<!-- frag: pay-upi-upfront-credits | weight: critical | topics: payments, weight-items, substitutions -->
UPI has no reliable hold mechanism, so UPI orders are charged the full estimate **upfront**, at checkout. After weighing, if the final amount is lower, the difference is returned automatically as GreenCart wallet credits (instant), not as a bank refund (slow). Because we can charge a UPI customer only once, anything after checkout — substitutions, weight changes — may only make a UPI order **cheaper or equal, never costlier**. This single sentence quietly shapes the substitution rules; see the [substitution spec](08-substitutions-spec.md).
<!-- /frag -->

Credits under ₹100 are automatic. Larger give-backs follow the [refunds policy](04-refunds-policy.md).

### Cash on delivery

No money moves until the doorstep. First-time customers have a COD limit — see [fraud rules](20-fraud-rules.md).

## Retries: the rule written in blood

<!-- frag: pay-retry-attempt-id | weight: critical | topics: payments, reliability -->
Every payment attempt carries an **attempt ID**. If a charge fails or times out and we try again, the retry MUST reuse the same attempt ID. PayOrbit uses that ID to make sure a retried charge can never become a second charge. In August 2024 a retry path generated a fresh ID and we double-charged 1,800 customers on a Saturday. Read the [incident report](05-incident-2024-08-double-charge.md). Never retry a payment by "just calling charge again" — that is exactly what did it.
<!-- /frag -->

## Money is stored in paise

All amounts everywhere are whole numbers of paise (₹1 = 100 paise). Never decimals, never floats. The short [price storage note](11-price-storage-note.md) explains why we are strict about this.

## Saved cards: what is true today

<!-- frag: pay-token-rule | weight: critical | topics: payments, saved-cards -->
We do not store card numbers. Anywhere. Ever. The rules for card storage in India changed, and today the only allowed way to "save a card" is a **token** issued through the payment provider — the card number itself never touches our systems. There is an old saved-cards plan from 2024 in this folder that assumed we would encrypt and store card numbers ourselves. That plan is **abandoned and its storage approach is no longer allowed**. If saved cards come back, they come back as PayOrbit tokens. Do not follow the old document: [Saved cards PRD (abandoned)](15-prd-saved-cards-2024.md).
<!-- /frag -->

Support agents see only the last 4 digits, ever — see [data access rules](28-security-data-access.md).
