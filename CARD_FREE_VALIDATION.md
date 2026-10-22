# Card-free access release — 22 October 2026

## Result

New accounts can use Circle for 180 days from their own verified Firebase account creation date, without entering a card or creating a Stripe subscription. They can publish up to five active items. The server enforces the dates and limits, including simultaneous creation and reactivation. Client-supplied dates and subscription fields cannot reset the period.

After expiry, the app prompts the user to choose payment. Listings pause and new requests/offers are blocked until paid access is confirmed. Existing approved agreements, messages, account profiles and listing data remain available. There is no automatic subscription or charge at day 180. Paid Circle Plus permits up to 20 active items and renews monthly until cancelled.

Existing Stripe subscriptions and existing Stripe trials retain their contracted prices and dates. No subscription history was reset, no production accounts were migrated, and no listing data was deleted.

## Prices and Stripe configuration

New monthly prices are 29 DKK, 43 SEK and 41 NOK. The latter two approximate 29 DKK using the ECB reference rates published 21 October 2026 (DKK 7.4746, SEK 11.0975, NOK 10.5120 per EUR). Source: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

Separate active monthly Stripe Prices were created on the existing Circle Plus product `prod_VTeaj5S7iG3YE5`:

| Currency | Amount | New Live Price |
| --- | ---: | --- |
| DKK | 29 | `price_1UTGRTLn6dV7DIk4jSwfPE9u` |
| SEK | 43 | `price_1UTGRWLn6dV7DIk4vCJ71VIn` |
| NOK | 41 | `price_1UTGRZLn6dV7DIk43Y5VPRoU` |

Only the corresponding three production price variables were updated in Netlify. Other variables, API keys, webhook secrets and existing prices were preserved. Existing tax behaviour was retained; Stripe Tax was not newly enabled and tax registrations were not changed.

Checkout is allowed only after the server confirms expiry. It uses these validated currency/amount/monthly prices, collects payment details at that point, displays the first-payment and renewal terms, and creates no additional Stripe trial. Duplicate subscriptions are blocked, older checkout offers are expired, and lost-response retries use the same idempotency key. Verified Stripe events remain responsible for paid access and payment-failure synchronisation. Legacy Sandbox customer IDs remain safely handled.

## Verification

- `npm test`: **177 passed, zero failed**, including its production `npm run build` step.
- `npm run lint`: zero errors; 12 pre-existing image warnings.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed.
- Tests cover individual 180-day deadlines, leap/DST boundaries, server-verified signup dates, free five-item concurrency/reactivation limits, expired public visibility, DA/SV/NB offers, all three paid currencies, existing paid/trial subscriptions, cancellation, payment failure, verified webhook handling and preserved agreement access.
- Browser checks exercised actual offer components for free access and expired access in Danish, Swedish and Norwegian. Physical iPhone/Android hardware was not used.

## Actual Stripe Sandbox payment

Only synthetic test data and Stripe's `pm_card_visa` fixture were used in Sandbox account `acct_1Tvn9bLK5NGqmEIh`:

- Test price: `price_1UTGdjLK5NGqmEIhDBrD33gn`, 2,900 minor DKK units monthly.
- Test customer: `cus_VUF9Xv9U50L9Qc`.
- Subscription: `sub_1UTGkNLK5NGqmEIhS1Wl28GP`, `active`, `trial_start=null`, `trial_end=null`.
- First invoice: `in_1UTGkNLK5NGqmEIhf8YJv5vW`, `paid`, amount due/paid 2,900, remaining zero, one automatic attempt, `livemode=false`.

The first paid invoice was actually collected by Stripe Sandbox, not marked paid manually. This representative DKK test complements automated currency/Checkout tests for DKK, SEK and NOK; it is not a claim of three separate live payment tests. The preceding app-based free period is tested with injected server time; a Stripe Test Clock is unnecessary because there is no Stripe subscription during those 180 days. No Live test payments were made.

Release commit and Netlify deployment identifiers are recorded in the accompanying local deployment receipt after publishing.
