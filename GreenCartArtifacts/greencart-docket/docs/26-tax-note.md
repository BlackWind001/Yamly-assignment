---
title: Tax in prices — the one-page version
author: Kiran Joshi (Finance)
last_updated: 2024-04-09
status: active
original_format: docx
---

# Tax in prices — the one-page version

Two rules cover almost every question engineers ask finance about tax.

<!-- frag: gst-delivery-fee | weight: background | topics: pricing, tax -->
**Item prices shown in the app are final — tax already inside.** The shelf price is what the customer pays for the item, full stop. **The delivery fee is the opposite: shown as a base fee, with 5% GST added at checkout.** So the checkout math adds delivery-fee tax as its own line after the free-delivery check ([coupon rules](12-coupon-rules.md) has the full order of operations). If a total is ever off by a few rupees, the delivery-fee tax line is the first place to look.
<!-- /frag -->

Invoices customers download show the tax split per line as required; that formatting lives in the invoice service and finance owns the template. When in doubt about anything tax-shaped, ask finance before shipping — tax mistakes are the expensive kind of small.
