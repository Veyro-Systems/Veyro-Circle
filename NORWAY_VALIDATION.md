# Norwegian launch validation — 21 October 2026

Norwegian Bokmål (`nb`) and Norway (`NO`) extend the existing Danish/Swedish application. Country controls currency independently of the selected interface language. The new Norwegian consumer price is **69 NOK/month**, with the existing **180-day trial only for eligible new Circle Plus customers**. Existing subscription history is retained and eligibility is verified on the server against Stripe and stored history.

## Changes

- Norwegian login, tour, account/profile, listings, requests, agreements, messages, notifications, subscription offer and legal page (`/legal/nb`). Three language choices on desktop and mobile.
- Norwegian country/address selection, +47 phone handling, saved searches, postcode search and community map coverage.
- 5,132 Norwegian postal rows appended to the existing 20,046 Danish/Swedish rows. Every previous row and array-index ID is unchanged; the prefix is checked by SHA-256 in `tests/norway.test.mjs`.
- Norway-specific tax guidance links to Skatteetaten. Danish/Swedish acknowledgement versions remain unchanged.
- Norwegian Checkout uses `locale=nb`, the server-selected NOK price, mandatory card collection and a 180-day trial only after a server eligibility check. Returning/active subscribers retain existing rules. Verified webhook state remains the source of access, including `trialing`, cancellation and payment failures.

## Automated and browser verification

- `npm test`: **170 passed, 0 failed** (includes the Next production build).
- `npm run lint`: **0 errors**, 12 existing `next/image` warnings.
- `npm run build`: passed; `/` and `/legal/nb` generated successfully.
- `npx tsc --noEmit`: passed.
- Tests cover Norwegian Checkout/currency/eligibility, invalid NOK configuration failing closed, protected profile fields, language-only updates, postal ID preservation, Norwegian rendered copy, notifications and existing agreement/billing regressions.
- Browser checks at widths 320, 375, 390 and 412: login, language controls and header logo fit without horizontal overflow or overlap. Norwegian tour steps and the compact 69 NOK offer were inspected. These are responsive browser checks, not physical iPhone/Android device tests.
- A local mocked profile selected Norway and `0010 Oslo`; no production account was created or edited for this check.

## Stripe Sandbox evidence

Isolated synthetic data in sandbox account `acct_1Tvn9bLK5NGqmEIh`; no live payment tests.

| Item | Verified value |
| --- | --- |
| Test price | `price_1UT2SKLK5NGqmEIhJmoPnsfd`, 6,900 minor units, NOK/month |
| Test clock | `clock_1UT2TOLK5NGqmEIhN4gU7qib` |
| Synthetic customer | `cus_VU0VYs2Ww9fcIK`, Norway, `nb`, Stripe test Visa |
| Subscription | `sub_1UT2W0LK5NGqmEIh7BjzULPM` |
| Trial start/end | `1792584000` / `1808136000` — exactly 180 days |
| Trial lifecycle | `trialing` → `active`; `charge_automatically` |
| First renewal invoice | `in_1UT2l7LK5NGqmEIh8b5rheZN`, `paid`, amount due/paid 6,900 NOK minor units, remaining 0, one automatic attempt |

The clock advanced in 45-day steps, then to two hours after expiry. Stripe finalized and paid the first renewal automatically; it was not manually marked paid. The first paid period begins 19 April 2027. Norwegian hosted Checkout independently displayed “180 dager gratis”, 69 NOK/month, the first billing date, card fields and automatic renewal/cancellation terms before confirmation. Its session had `livemode=false`, `currency=nok`, `locale=nb`, `payment_method_collection=always`. The Checkout form was inspected without submitting it.

Cancellation before the first charge and payment-failure/webhook synchronization remain covered by the existing automated lifecycle tests. The new Norwegian Sandbox simulation verified successful expiry and first payment; it did not repeat every failure scenario against Stripe itself.

## Production configuration

- New price only: `price_1UT2mkLn6dV7DIk4kDznUuI0`, same Circle Plus product `prod_VTeaj5S7iG3YE5`, active, 69 NOK monthly, inclusive tax behavior.
- New site-level Netlify variable only: `STRIPE_PRICE_NOK` for production. Existing environment variables were compared before/after and remained identical.
- Existing 49 DKK / 69 SEK prices, API keys, webhook secret, customer records and subscriptions were not changed.
- Stripe Tax/registrations and automatic tax settings were not changed. Any required Norwegian VAT registration/reporting must be confirmed separately; this release is not a tax or legal compliance audit.

Release uses the existing `main` branch and Netlify Git build. Deployment identity and live smoke-check evidence are recorded in the task workspace after publication.
