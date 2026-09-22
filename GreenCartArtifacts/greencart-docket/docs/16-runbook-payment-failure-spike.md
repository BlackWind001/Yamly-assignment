---
title: "Runbook: payment failures are spiking"
author: Dev Sharma (Payments Engineer)
last_updated: 2025-06-02
status: active
original_format: md
---

# Runbook: payment failures are spiking

You are here because the payment failure alert fired or support says "everyone's payment is failing." Work top to bottom. Stay calm; this runbook exists because we were not calm once.

## Step 1: Is it us or the provider?

Check PayOrbit's status page and our failure telemetry (`payment-failures.json` shape, live dashboard version). If failures are spread across UPI **and** cards, it is almost always the provider or the banks behind them, not our code. If it is one method only, look at the most recent deploy touching that method's path.

## Step 2: If UPI is down, switch to backup

<!-- frag: runbook-provider-toggle | weight: helpful | topics: payments, reliability -->
We keep a backup UPI provider (**Cashlane**) behind a config toggle. Flipping the toggle moves new UPI attempts to Cashlane within a minute; in-flight attempts finish on PayOrbit. **Cards have no backup provider** — card holds and captures live inside PayOrbit, so a PayOrbit card outage is a wait-it-out situation: keep checkout open, let card attempts fail fast with a clear message suggesting UPI or COD, and do not queue card charges for later replay.
<!-- /frag -->

## Step 3: The thing you must never do

<!-- frag: runbook-no-manual-retry | weight: critical | topics: payments, reliability -->
**Never retry a stuck payment by manually calling the charge again** — not from a console, not with a script, not "just this once for a VIP customer." Manual charges mint fresh attempt IDs, and a fresh attempt ID on a charge that actually succeeded is exactly how the [August 2024 double-charge](05-incident-2024-08-double-charge.md) happened. The system's own retry (same attempt ID, safe to repeat) resumes automatically when the provider recovers. Your job during an outage is toggles and communication, not charges.
<!-- /frag -->

## Step 4: Communicate

Post in the incident channel every 30 minutes even if nothing changed. Tell support what to say to customers. If checkout is degraded for more than an hour, the app banner (config toggle) beats a thousand support chats.
