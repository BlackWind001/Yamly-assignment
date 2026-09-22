---
title: Prices are whole paise. Always.
author: Dev Sharma (Payments Engineer)
last_updated: 2023-05-11
status: active
original_format: md
---

# Prices are whole paise. Always.

<!-- frag: paise-integers | weight: background | topics: payments, data -->
Every amount of money in every GreenCart system is stored as a whole number of **paise** (₹1 = 100 paise). ₹123.45 is stored as 12345. Never rupees with decimals, never floating point. Computers do not do exact math on decimal fractions, and money that is off by one paisa is money that finance spends a day hunting every quarter. Display code divides by 100 at the last possible moment and nowhere else.
<!-- /frag -->

If an external system (a store's billing export, a provider report) gives rupees with decimals, convert at the boundary and store paise. This rule is old, boring, and has never once been regretted.
