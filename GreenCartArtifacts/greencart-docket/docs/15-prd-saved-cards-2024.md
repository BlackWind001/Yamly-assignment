---
title: PRD — Saved cards at checkout (2024)
author: Rohit Menon (Product Manager) with Dev Sharma (Payments)
last_updated: 2024-06-20
status: abandoned
abandoned_reason: "Storage approach no longer allowed under card rules. See payments design doc for current truth."
original_format: docx
---

# PRD — Saved cards at checkout (2024)

> **ABANDONED (October 2024).** Parts of this document are now wrong. The technical storage approach below is **no longer allowed** — see [payments design](03-payments-design.md) for what is true today. The customer research and checkout flow sections remain genuinely useful. This document is kept because deleting history is worse than marking it.

## The problem

A quarter of our orders are paid by card, and card customers type their full card number for every order. Checkout data from May 2024: card customers take about 40 seconds longer to pay than UPI customers, and card payment screens are where we lose the most completed carts. Regular customers ask for saved cards in app reviews more than any other payment feature.

## Customer research (still valid)

<!-- frag: old-ux-flow | weight: helpful | topics: saved-cards, checkout-ux -->
What customers told us they want, which has not changed: saving should be an **opt-in checkbox at the moment of a successful payment** ("Save this card for next time"), never a separate setup screen — nobody visits a wallet settings page to add a card in advance. At checkout, the saved card should appear as the **pre-selected default** with the last 4 digits and the card network, one tap to pay, with "use another card" a visible but secondary path. Removing a saved card must be self-serve and instant. In interviews, the single biggest trust concern was "will I see exactly which card this is" — hence last-4 plus network logo everywhere a saved card is shown.
<!-- /frag -->

## Technical approach (WRONG — do not follow)

<!-- frag: old-assumption-self-storage | weight: critical | topics: saved-cards, payments, outdated -->
**This section is the reason the document is marked abandoned. Do not build this.** The 2024 plan was to encrypt full card numbers ourselves and store them in our own database, with keys held in a separate service. Card storage rules in India changed: businesses like us may not store card numbers at all, encrypted or otherwise. The only allowed approach today is a **token** from the payment provider (PayOrbit) — the card number never touches GreenCart systems, and we store only the token plus display data (last 4, network). Anyone reviving saved cards must design against the token approach in the [payments design doc](03-payments-design.md), and treat this section purely as a record of what we almost did.
<!-- /frag -->

## Rollout plan (as written in 2024)

Phase 1 to 5% of card users behind a flag; watch payment success rate and support tickets for two weeks; then open gradually. Fraud review rules for saved cards were to be agreed with the fraud team before launch — that conversation produced the rule now recorded in [fraud rules](20-fraud-rules.md), which outlived this PRD.
