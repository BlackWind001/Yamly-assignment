---
title: How an order works, end to end
author: Meera Kulkarni (Senior Engineer — no longer at GreenCart)
last_updated: 2024-11-02
status: active
original_format: md
---

# How an order works, end to end

This document follows one order from the moment a customer taps "Place order" to the moment the bag reaches their door. Read it once slowly. Almost every other document in this folder hangs off some step described here.

## Step 1: The customer places the order

The customer fills a cart and pays (or chooses cash on delivery). Details of paying are in the [payments design doc](03-payments-design.md). The important thing here: at this moment, we do not yet know if the store can actually serve this order.

## Step 2: The store gets five minutes

<!-- frag: order-clock | weight: helpful | topics: delivery, promise -->
The order goes to the store. Under our contract, the store has five minutes to reject it (for example, the store is closing early, or their fridge broke). If they do nothing for five minutes, the order is treated as accepted. The customer-facing two-hour promise counts from the moment the customer placed the order — not from acceptance. So those five minutes eat into our two hours. See [the delivery promise](07-delivery-promise.md) for how the full time budget is split.
<!-- /frag -->

Store rejections are rare (well under 1%) but the five-minute window exists in the legal agreement and we cannot shorten it on our own. See the [store agreement summary](21-store-agreement-summary.md).

## Step 3: A picker picks the order

A GreenCart picker inside the store gets the order on their handheld app. They walk the aisles and pick each item.

Here is the part new engineers always get wrong: **the stock number in our database is a guess.** It syncs from the store's own billing system every 30 minutes, and the store's own number is often wrong too, because walk-in shoppers take things off shelves all day. The only truth is what the picker sees on the shelf. Our whole [substitution flow](08-substitutions-spec.md) exists because of this one fact.

## Step 4: Weighing

<!-- frag: picking-weighing | weight: helpful | topics: payments, weight-items -->
Loose items — vegetables, fruits, some grains — are sold by weight. The customer orders "about 500g of tomatoes," but nobody can pick exactly 500g. The picker weighs what they picked, and the final price is set only at this moment. This is why card payments place a temporary hold for more than the cart total, and why paying by UPI works differently. The details live in [payments](03-payments-design.md) and the short [weight items note](09-weight-items-pricing.md).
<!-- /frag -->

## Step 5: Payment is completed

Once picking and weighing are done, we take the real, final amount. Before this point we have not actually taken money on card orders — only held it.

## Step 6: A rider delivers

The packed bag goes to a rider. Riders often carry up to three orders at once; how orders are grouped is in [rider batching](25-rider-batching.md). The customer gets a "rider is arriving" message near the end — the only message allowed at night, see [notification rules](19-notification-rules.md).

## Step 7: Done, or not quite

Most orders end here. The unhappy paths — refunds, wrong items, missing items — are covered in the [refunds policy](04-refunds-policy.md) and the [support playbook](17-support-playbook-refunds.md).

## The one-line summary

We sell certainty on top of uncertain stores. Every system you will touch is, in some way, a tool for keeping a promise we make before we know we can keep it.
