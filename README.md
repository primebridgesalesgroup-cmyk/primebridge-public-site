# Prime Bridge / A+ Ledger — public website

Live entry: https://primebridgesalesgroup.org/
Current wallet workspace: https://primebridgesalesgroup.org/dashboard.html
Customer announcements: https://primebridgesalesgroup.org/blockchain.html

## Implementation reference

[A_PLUS_LEDGER_BLUEPRINT.md](A_PLUS_LEDGER_BLUEPRINT.md) is the authoritative map
for the newest owner-approved three-screen design: public website -> secure A+
customer sign-in -> personal ledger. It records the current source, customer
navigation, reusable components and remaining service connections. The complete
approved visual design and authenticated ledger are not yet implemented.

## What is live

- Public service, participation, privacy and milestone pages.
- Customer-facing Blockchain news and roadmap.
- Public read-only browser-wallet workspace: explicit wallet connection, native
  and manually tracked ERC-20 balances, categories, search/filter and CSV export.
- Existing protected inquiry and opt-in waitlist frontends. A provider-accepted
  request and a confirmed business-inbox receipt remain separate evidence.

There is no A+ customer authentication service connected to these static pages.
Private customer records, portfolio pricing/history, transfers, exchange, code
leases and developer payouts must not be represented as connected. One-World is
an independent application/account. Stripe sandbox links remain explicitly test
only; the historical marketplace preview contains demonstration data.

## Source map

| Files | Responsibility |
| --- | --- |
| `index.html` | Public entry and services/participation destinations |
| `blockchain.html` | Customer announcements, roadmap and Energy Coin updates |
| `dashboard.html`, `dashboard.js`, `workspace.css` | Current public wallet workspace and connection boundaries |
| `services.html`, `inquiry.js`, `inquiry-delivery.js` | Service inquiry preparation, consent and protected delivery UI |
| `waitlist.html`, `waitlist.js` | Explicit launch/developer interest; not account registration |
| `privacy.html`, `waitlist-privacy.html` | Current inquiry and waitlist notices |
| `milestones.html` | Dated release archive |
| `styles.css`, `site.js` | Shared public styling, navigation and accessibility behavior |
| `preview/`, `sandbox.html` | Separate historical demonstration and Stripe test checkout |
| `.github/workflows/` | Navigation/browser checks and allowlisted Pages publication |
| `WORKSPACE-INTEGRATIONS.md` | Current wallet behavior and detailed integration boundaries |

Private application services remain in the existing private Prime Bridge
repository. Never copy private source, account records, keys, databases or
validator credentials into the Pages bundle. Do not duplicate the application
or change frameworks simply to match a suggested screenshot tech stack.

## Validation and publication

- Navigation/anchor/assets and JavaScript syntax checks run in CI.
- Browser checks cover public pages, forms, responsive layouts, explicit wallet
  consent, exact balance reads, account/network changes and stale-data clearing.
- Pages deploys only the assets explicitly staged by `publish-public-site.yml`.
- Backend/authentication/transaction services require their own deployment and
  owner-scoped integration evidence; static publication does not enable them.

For local source inspection, serve static files from this repository. Preserve
existing form field names, CAPTCHA/consent handling and privacy destinations.
See [REDESIGN-NOTES.md](REDESIGN-NOTES.md) only for the historical October 16 brief.
