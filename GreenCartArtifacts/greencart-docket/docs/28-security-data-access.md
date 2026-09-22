---
title: Who can see what — customer data access rules
author: Dev Sharma (Payments Engineer), reviewed by external security audit
last_updated: 2025-10-20
status: active
original_format: md
---

# Who can see what — customer data access rules

Short and strict. These rules are checked in the annual security audit, so tools that break them do not ship.

<!-- frag: support-last4-only | weight: helpful | topics: security, payments -->
**Support agents see the last 4 digits of a card and its network. Nothing more, ever.** Not in the support tool, not in logs, not in screenshots attached to tickets. We hold no full card numbers anywhere (see [payments](03-payments-design.md) — provider tokens only), so there is nothing more to show even by accident, and any new surface that displays payment details must follow the same last-4-plus-network shape. The same restraint applies to UPI: agents see the payment app name, not the customer's UPI handle.
<!-- /frag -->

Addresses: visible to support only for orders from the last 90 days; older orders show city and pincode only. Riders see the address only for the active delivery, and it disappears from their app after drop-off. Phone numbers are masked end-to-end — riders and customers call each other through a relay number, never directly. Internal analytics uses customer IDs, never names or phone numbers; the mapping lives in one access-controlled service.
