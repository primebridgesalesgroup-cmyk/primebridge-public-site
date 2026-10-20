# Prime Bridge customer release — 20 October 2026

## Release decision

Publish current business-service information, protected inquiries, launch registration, customer announcements and privacy pages. Preserve the approved A+ application implementation in source, but exclude it from production until the customer journey works end to end. Removing a public route is not implementation of its missing service.

## Findings corrected

- Homepage and shared navigation advertised customer sign-in, exchange, private ledger activity and code licensing although these journeys could not complete.
- `sandbox.html` exposed two Stripe test payment links with USD 1 fixture prices.
- `preview/` exposed fictional inventory, market and workflow records.
- Sign-in displayed disabled email/password/passkey controls and account-creation/recovery links without an identity service.
- The public dashboard presented unavailable transfers, purchases, exchange, licenses, transaction activity, notifications and valuation alongside wallet reads.
- Milestones promoted the demonstration and contained obsolete inquiry-verification language.
- The optional inquiry draft incorrectly directed customers to a form below it, although the delivery form is above it.
- Forms lacked a direct email fallback alongside their status.

## Current public surface

| Page | Customer action |
| --- | --- |
| Homepage | Choose a current business service, send an inquiry, read announcements |
| Services | Review preparation/consulting scope and send a protected inquiry |
| Launch updates | Explicitly register for announcements; registration is not an A+ account |
| Blockchain updates | Read customer-facing announcements and planned service releases |
| Progress | Read dated service milestones |
| Privacy notices | Read inquiry and announcement data-handling information |
| 404 | Recover from a retired or unknown address through current service links |

The form integration uses Web3Forms delivery and opt-in hCaptcha. Earlier owner-confirmed inbox delivery is recorded in the project history. This change does not send another message or claim a new inbox delivery check. A successful HTTP page response alone does not prove service delivery.

## Work required before application release

| Area | Missing connection or capability |
| --- | --- |
| Customer access | Deployed identity service, secure sessions, account isolation, account creation/recovery and supported passkey flow |
| Portfolio | Authenticated asset records, valuation source, historical pricing and portfolio history |
| Wallets | Production account-bound wallet association and supported mobile wallet connection; current browser wallet reads alone do not authenticate a customer |
| Ledger | Private transaction records, permissions, confirmations, fee accounting and payment/chain reconciliation |
| Exchange | Live listings, eligibility, order lifecycle, inventory reservation, payment/settlement and cancellation/refund handling |
| Code Bank | Developer onboarding, controlled code storage, ownership/rights records, listing/lease terms, authorized downloads/API access and developer payout accounting |
| Blockchain / Energy Coin | Verified production chain identity, validator/RPC availability, deployed contract identity and confirmed issuance/transaction rules |
| Billing | Production Stripe configuration on the intended account, signed webhook delivery, customer linkage and reconciliation; sandbox payment links are not a production checkout |
| Operations | Runtime host access, persistent records, configuration, monitoring, backups and deployment/rollback ownership |

Evidence: public main at `2857abcee7807f7d9154b976f171410eda19a6e0`; private main at `e0868c62b6031694d5f364a264bfab5d69b473dd`; private `docs/aplus/AWS_PRODUCTION_IMPLEMENTATION.md` explicitly labels its deployment plan specification-only. Remote Desktop Commander returned no connected devices during this review. Existing source modules and passing checks are not evidence that their services are deployed.

## Publication boundary

`scripts/build-public.py` creates `_public` from an explicit allowlist and validates page links/anchors. It rejects test payment or fictional-market content. The publish workflow uploads only this artifact. `_config.yml` excludes the same unready routes from legacy Jekyll-based GitHub Pages publication. Approved dashboard/sign-in/preview source remains in the repository and is not deleted.

Release verification covers the exact artifact at five viewport widths, current action links, forms, navigation, third-party loading boundaries, and HTTP 404 responses for excluded URLs. Existing isolated browser/form checks remain in CI and are not published as customer sample content.
