---
title: "Incident report: the double-charge Saturday (Aug 2024)"
author: Dev Sharma (Payments Engineer)
last_updated: 2024-08-19
status: active
original_format: md
---

# Incident report: the double-charge Saturday

**Date of incident:** Saturday, 10 August 2024, 6:10 pm – 8:45 pm
**Impact:** 1,803 customers charged twice on card orders. All refunded by Monday. Worst weekend for support in company history.

## What happened, in plain words

Saturday evening is our busiest window. Our payment provider (PayOrbit) got slow, and many card captures timed out. Timeouts are normal and we retry them.

The bug: a code path added earlier that month generated a **new attempt ID** for each retry instead of reusing the original one. To PayOrbit, a retry with a new ID is not a retry — it is a brand-new charge. Many of the "timed out" first attempts had actually succeeded on PayOrbit's side; we just never heard back in time. So the retry charged those customers a second time.

## Why it took two hours to notice

Each individual charge looked fine on its own. Nothing errored. The signal that finally caught it was customers calling support, not a system alarm. We have since added an alert on "captures per order attempt greater than one."

## The fix and the lesson

<!-- frag: incident-retry-lesson | weight: critical | topics: payments, reliability -->
The lasting rule from this incident: **a retry must be indistinguishable from the original attempt.** Same attempt ID, always, so the provider can de-duplicate on their side even when we are blind. This is now written into the [payments design doc](03-payments-design.md) and enforced in code review for anything touching charge paths. If you are ever tempted to "just call charge again" during an outage — including manually from a console — read this report first, then read the [runbook](16-runbook-payment-failure-spike.md) instead.
<!-- /frag -->

## Follow-ups completed

Alert on duplicate captures (done, Aug 2024). Retry helper that makes it impossible to mint a new attempt ID mid-retry (done, Sep 2024). Runbook rewritten (done, Sep 2024).
