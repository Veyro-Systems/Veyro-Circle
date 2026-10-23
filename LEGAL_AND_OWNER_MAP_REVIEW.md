# Legal content and owner map review — 23 October 2026

## Delivered changes

- Original Danish, Swedish and Norwegian privacy, cookie and user/subscription terms, matched to the current application. Reference material was used to identify topics, not as publishable wording.
- Confirmed controller/seller: Veyro Systems ApS, CVR 46834941, Skellet 8, 4174 Jystrup, Denmark; info@veyrosystems.com.
- The existing `/legal`, `/legal/sv`, `/legal/nb` routes and `#privacy`, `#terms`, `#cookies` anchors remain available. Paid offers link to cancellation/withdrawal information.
- Current offer remains 180 calendar days without a card, five active listings, then an explicit paid subscription at 29 DKK / 43 SEK / 41 NOK per month with 20 active listings. No automatic conversion of the free period. No commission or automatic rental insurance. Proposed alternative price tiers have not been implemented.
- The community map and postcode counts require a verified Firebase identity explicitly allowed by server configuration. Both navigation menus hide the map for other users. Direct data requests are rejected before querying Firestore.
- Server configuration: `CIRCLE_MAP_OWNER_UIDS` is a comma-separated UID allowlist; `CIRCLE_MAP_OWNER_EMAILS` allows exact, verified partner addresses. Missing configuration denies access. Values belong in Netlify function environment settings, never client configuration. Access responses and count data use `private, no-store`.

## Verified production configuration and account operation

Read-only Google API checks confirmed both the default Firestore database and the Circle Storage bucket use `europe-west1` (Belgium). Firebase Authentication is separately documented by Google as a US-only service. The public policy explains both facts without claiming all processing is EU-only.

At the user's explicit request, their login address was changed on the existing UID and the Firestore profile's email field was updated with a document-version precondition. A private backup was saved outside this repository first. Read-back verified the password metadata, profile fields other than email, subscription/history/free-access dates and both owned listings were unchanged. The new address is intentionally unverified; the user must sign in with their existing password and verify it through the standard email flow. Stripe was not changed. The partner address did not yet have an Auth account at the time of the audit; registration and email verification are required before its allowlist entry grants access.

## Validation

- `npm test`: production build and **204/204 tests passed**, including five owner-map authorization tests.
- Authorization cases cover ordinary users, forged owner parameters, anonymous requests, no configured owners, unverified partner addresses, exact-address matching, aggregated output and no-store caching.
- `npm run lint`: no errors; 12 pre-existing image-element warnings.
- Final production build and rendered legal-content checks run again after documenting the verified EU region.
- Browser checks cover legal content and mobile wrapping; live route/status checks are recorded outside the repository after deployment.

## Operational items still requiring verification

Updating these texts does not itself establish every compliance process. The following were not represented as completed:

- Audit the actually accepted provider DPAs, current subprocessors and applicable transfer safeguards, including Google, Netlify, Stripe and the support email service. The database/bucket regions were verified; all provider processing locations were not.
- Define and operate a documented physical deletion/backup retention process. Existing agreement visibility expires after 12 months, wanted-post visibility after 30 days and push registration use after 30 days without renewal. Those filters are not a physical deletion schedule. No customer data was deleted during this work.
- Confirm delivery of the applicable subscription terms and withdrawal information on a durable medium at purchase. A web page/link alone does not demonstrate this. Current Checkout/receipt settings have not been certified as meeting that requirement.
- Keep a process for rights requests, misuse reports, withdrawal/refund requests and advance notice of material contractual changes.

## Primary references reviewed

- [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679) and [Datatilsynet: rights guidance](https://www.datatilsynet.dk/Media/C/0/Registreredes%20rettigheder.pdf).
- [Firebase privacy and service locations](https://firebase.google.com/support/privacy), [Firestore regions](https://firebase.google.com/docs/firestore/locations), [Netlify privacy](https://www.netlify.com/privacy/), [Stripe privacy](https://stripe.com/privacy), [OSM Foundation privacy](https://osmfoundation.org/wiki/Privacy_Policy).
- [Danish subscription guidance](https://forbrug.dk/emner/aftaler-og-abonnementer/abonnementsvilkaar), [withdrawal guidance](https://forbrugerombudsmanden.dk/alle-emner/forbrugeraftaler/fortrydelse), [Swedish withdrawal guidance](https://www.konsumentverket.se/konsumentratt-process/angerratt/), [Norwegian complaint routes](https://www.forbrukerradet.no/her-klager-du/).
