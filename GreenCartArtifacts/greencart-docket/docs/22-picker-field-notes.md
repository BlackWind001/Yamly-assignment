---
title: Field notes from picker shadowing — what the shelf actually looks like
author: Rohit Menon (Product Manager), after two days picking in Pune and Indore
last_updated: 2025-09-12
status: active
original_format: md
---

# Field notes from picker shadowing

I spent two days working as a picker. Everyone building anything pickers touch should do this once. Raw notes, lightly cleaned.

<!-- frag: picker-shelf-truth | weight: critical | topics: stock, substitutions -->
The single biggest thing: **pickers do not trust the app's stock number, and they are right not to.** The handheld says 3 units; the shelf says 0; this happens many times per shift and surprises nobody on the floor. Experienced pickers glance at the number as a rough hint ("probably there" vs "probably gone") and then believe their eyes. Any flow that forces a picker to argue with the system about what is on the shelf — extra confirmation taps, "are you sure it's out?" dialogs — gets worked around within a week. Build for "the picker is the sensor," not "the picker executes the database."
<!-- /frag -->

<!-- frag: picker-evening-rush | weight: helpful | topics: operations, stock -->
The 5–8 pm rush changes everything. The weighing scale gets a queue; pickers batch all their weighed items into one scale visit instead of weighing as they go, so weighed items are picked in a different order than the list shows. Stock also drains fastest exactly then — evening out-of-stock is a different world from morning (the telemetry in `stock-and-substitutions.json` shows the same split in numbers). Anything timing-sensitive — the three-minute substitution window, picking-speed dashboards — behaves differently at 6 pm than at 11 am, and should be judged separately for peak.
<!-- /frag -->

Small things that stuck with me: pickers memorize store layouts within days and resent app-imposed pick orders that fight the aisle order; substitution suggestions that point to the far side of the store get skipped under time pressure; and every picker I met could name the products that are "always wrong in the app" for their store. That last one deserves its own project someday.
