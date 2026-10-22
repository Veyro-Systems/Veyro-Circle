# Subscription portal repair — 22 October 2026

The production failure was confirmed in Stripe Workbench: a Live portal request returned `resource_missing` because the stored customer existed only in test mode. The current authenticated login does not have a matching Live billing customer. A Live customer exists for a separate Firebase login and must not be linked automatically.

## Result

- Portal creation first verifies the stored customer in the server's Stripe environment.
- A missing/deleted customer can be recovered only through the authenticated email **and** an exact Firebase UID match in server-recorded Stripe metadata. Email alone never authorises access. Ambiguous matches fail closed.
- Permission errors and Stripe outages do not trigger customer replacement.
- A valid existing billing customer opens the Stripe portal normally, with a server-selected return URL and a private, non-cacheable response.
- When no billing customer belongs to the login, the subscription view explains this in Danish, Swedish or Norwegian. It preserves Plus access and does not claim a next Live payment date for an unusable legacy reference.
- No replacement customer, subscription, Checkout session or payment is created. Firebase profiles, subscription history, prices, API keys, webhook secrets, tax settings and existing subscriptions are unchanged.

## Validation

- `npm test`: **193 passed, zero failed**, including production build.
- Fourteen new server portal cases cover stale test IDs, deleted customers, correct existing customers, legacy metadata, pagination, forged client parameters, ownership mismatch, ambiguous/missing matches, authentication, permission errors and outages.
- Client coverage confirms a missing billing account cannot redirect to Checkout. Rendered UI coverage checks the explanation and preserved Plus access in all three languages.
- Stripe Live accepted a portal session for an existing authorised Live customer. This only created an expiring portal link; no subscription or payment was changed.
- The current login is expected to show the account-specific explanation, since its stored test subscription has no corresponding Live billing customer. The release is verified through that actual signed-in browser flow after deployment.

Local release receipts and screenshots record the published commit and the final browser result. They contain no API keys or webhook secrets.
