---
title: The two-hour promise, and the real time budget behind it
author: Anita Rao (Head of Operations)
last_updated: 2025-12-01
status: active
original_format: docx
---

# The two-hour promise, and the real time budget behind it

Customers see one number: **delivered within 2 hours.** Internally, we never plan to two hours. This document explains the real budget, because every few months someone proposes a change that accidentally spends buffer we cannot spare.

## The budget

<!-- frag: promise-math | weight: critical | topics: delivery, promise -->
The two hours the customer sees breaks down internally as: **5 minutes** for the store's contractual accept/reject window (see [store agreement](21-store-agreement-summary.md)), then a **90-minute internal plan** for picking, packing, and delivery, then roughly **25 minutes of buffer** that belongs to nobody. Riders, batching logic, and picker staffing are all sized against the 90-minute plan, not against two hours. If you give the 90 minutes more work to do — bigger batches, longer routes, slower stores — you are not "still within two hours," you are spending the buffer that absorbs rain, traffic, and lifts that don't come.
<!-- /frag -->

<!-- frag: promise-clock-customer | weight: helpful | topics: delivery, promise -->
One subtlety that trips people up: the customer's clock starts at **order placed**, but the operational plan starts at **store acceptance**, up to five minutes later. Dashboards that measure "time to deliver" from acceptance quietly look 5 minutes better than what the customer experienced. When you read lateness numbers, always check which clock they use. The telemetry file `delivery-lateness.json` uses the customer's clock.
<!-- /frag -->

## Why two hours is a brand number

We could promise three hours and hit it trivially. We don't, because "under two hours" is the reason many customers chose us over planning a store trip. The leadership discussion about whether Indore should move to a four-hour window is captured honestly in the [offsite notes](13-offsite-notes-2025-delivery-debate.md) — read those before proposing window changes; the arguments on both sides are already well made.
