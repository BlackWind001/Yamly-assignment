---
title: "Meera's notes — things I wish someone had told me"
author: Meera Kulkarni (Senior Engineer — no longer at GreenCart)
last_updated: 2025-02-20
status: stale
stale_reason: "Author left March 2025. Content was accurate when written; nobody owns it now. Verify before relying."
original_format: md
---

# Meera's notes — things I wish someone had told me

I kept this as a personal file and cleaned it up before leaving. It is the stuff that lives in people's heads. Some of it will go stale after I'm gone — check dates, and when a proper document disagrees with this one, trust the proper document.

<!-- frag: meera-trust-picker | weight: helpful | topics: stock, culture -->
**The one sentence that explains half our systems: trust the picker, not the database.** Stock numbers are 30-minute-old rumors from store systems we don't control. Every good design decision here starts from that; every bad one starts from pretending the database is the shelf. If you're new and something about stock or substitutions seems overbuilt, it isn't — read the [Indore incident](06-incident-2025-02-stale-stock.md) and the [field notes](22-picker-field-notes.md).
<!-- /frag -->

<!-- frag: meera-jp12-cases | weight: helpful | topics: stock, data, jaipur -->
**Jaipur store JP-12 sends stock in cases, not units.** Their billing system counts a carton of 24 as "1". The sync job has a special multiplier just for JP-12's affected categories (it's marked in the sync config, search for JP-12). If JP-12 stock ever looks impossibly low — everything showing 1 or 2 — the multiplier config broke again. This has bitten us twice, both times on a weekend, both times diagnosed slowly because nobody remembered. Now it's written down.
<!-- /frag -->

<!-- frag: meera-utc | weight: background | topics: data, time -->
**Everything backend is UTC; India is UTC+5:30; the half hour is where the bugs live.** "Daily" reports cut at midnight UTC are cutting at 5:30 am IST, which is almost fine and therefore never noticed until someone compares against a store's own daily numbers and finds a mismatch nobody can explain. If a daily number is slightly off, check the cut boundary first — it's the answer more often than you'd believe. Full conventions in [API conventions](29-api-conventions.md).
<!-- /frag -->

<!-- frag: meera-v1-april | weight: background | topics: data, legacy -->
**If finance says April looks double, someone wrote to orders_v1 again.** It's read-only by rule, not by enforcement (the enforcement keeps being deprioritized). The rule and the history are in [why we have two order tables](23-why-two-order-tables.md); the fastest check is simply whether anything wrote rows there this month.
<!-- /frag -->

Assorted, briefly: the coupon/free-delivery threshold trap catches someone yearly (documented now in [coupon rules](12-coupon-rules.md), point people there instead of explaining it again). PayOrbit's test environment silently succeeds on amounts above ₹1 lakh instead of rejecting them — don't trust big-amount tests. And the store agreement's five-minute rejection window is legal, not technical — product cannot "just shorten it," people ask every year.
