# Search maps and public owner profiles

Implemented 23 October 2026.

- Search results support List, Kanban and Map in Danish, Swedish and Norwegian. All views share the existing text, category, distance, price, dates and favourites filters.
- Map markers group nearby listings, including multiple listings at the same postal centre. Selecting a marker shows the matching previews at the top right. Selecting a preview opens that exact listing in the existing listing dialog.
- The map supports drag, keyboard navigation, zoom and fitting all results. Preview scrolling is separate from map dragging and wheel zooming.
- Public owner profiles show listings in the left column and identity, approximate town map and reviews in the right column on desktop. Smaller screens use a single column.
- Both maps resolve locations from the postal catalogue. Profile-supplied coordinates cannot determine the public map centre. Private street addresses and precise GPS coordinates are not used.
- The private community account-count map retains its existing server-side owner restriction. The public search map does not call that API or expose account counts.
- Selected favourite hearts are filled red on listing cards and in the listing dialog.
- The privacy policy explains the public approximate maps and OpenStreetMap tile requests in all three languages.

No database migration, subscription changes, product-price changes or data deletion is required for these changes.

Validation: `npm test` passed all 220 tests. After the final touch-scrolling refinement, `npm run build` passed and all 220 tests passed again against the final files. `npm run lint` completed with zero errors and 12 existing image-optimization warnings. Tests cover postal-centre privacy, Danish/Swedish/Norwegian map geometry, co-located listing selection, translated controls, favourite states and the public owner API field allowlist. Validation logs and Netlify receipts are stored outside the repository in the workspace's `validation` directory.

The browser connection failed during final map inspection. Final visual inspection and actual touch-device testing could not be completed in this session; automated responsive geometry and server-rendering checks do not replace those checks.
