# A+ customer workspace

The approved next design and source map are in [A_PLUS_LEDGER_BLUEPRINT.md](A_PLUS_LEDGER_BLUEPRINT.md).
This document describes the current implementation, not the completed private ledger.

The public homepage and `dashboard.html` use the existing monochrome A+ identity.
The dashboard provides Assets, Wallets, Ledger, Blockchain, Exchange, Code/API
Licenses, Security and Account sections. It uses real browser-wallet reads and
has no sample holdings, manufactured transactions or simulated checkout.

## Connected behavior

- Browser-wallet discovery (EIP-6963 and injected EIP-1193 fallback), explicit
  account permission, selected-account/network changes, disconnect and refresh.
- Native balance and observed block number through the selected provider. Known
  EVM networks use their named native currency and 18 decimals. Unrecognized
  chains display native base units rather than assuming token denomination.
- Manual ERC-20 balance/decimals/symbol reads (up to 20 contracts), scoped to the
  selected network; tracked contracts clear on account/network changes.
- Search, category filters and CSV export of successful displayed reads. Export
  protects formula-leading strings. Text is rendered through textContent.
- Addresses/balances remain in page memory. No automatic wallet RPC, third-party
  script, Prime Bridge API request, signature, approval or transaction is made.
- One-World account navigation uses its existing `?view=home&open=account` entry.
  One-World authentication is separate; no cross-site cookie or token copying.

## Remaining deployment connections

| Section | Required production service |
| --- | --- |
| Account | A+ identity on a suitable HTTPS application host; authenticated owner-scoped sessions, CSRF, recovery and sign-out. No credentials collected by static Pages. |
| Asset register | Authenticated inventory/evidence/rights listing, tenant ownership enforcement and versioned category schema. Wallet possession is not asset title. |
| Ledger | Owner-scoped transaction listing, immutable IDs, pagination and reconciliation of payment, fee, chain and fulfillment events. |
| Blockchain updates | Customer-facing news/roadmap at `blockchain.html`; no code explanation or network diagnostics. |
| Security / wallet network details | Observed wallet-provider network reads. Production RPC, chain ID/genesis, verified contracts, indexer/explorer and finality remain separate backend work. |
| Exchange | Authorized real catalog, inventory reservation, order state, capture/refund and settlement; no front-end-only paid status. |
| Code/API licenses | Deploy private PR184's code-bank API/contract, confirm immutable treasury/fee configuration and connect authenticated lease/expiry/download services. |
| Billing | Deploy PR183 and separately implement production-approved billing; Stripe test fixtures are not production prices. Signed webhook reconciliation is required. |

The pages show unavailable connections explicitly. They do not remove backend
release gates, create customer identities, issue APEC or collect funds. There
is no setting that promotes these static pages into an authenticated market.
Public GitHub Pages remains a public website/read-only interface; a transactional
application needs suitable application hosting before its operational links
are enabled. Private source and account records must never enter the Pages bundle.

The homepage replaces the long introductory layout with the workspace entry and
service directory. Older marketplace demonstrations remain at their original
preview URL for reference; this dashboard never loads their example data. Stripe
sandbox links remain separate and are not the primary homepage call to action.

## Approved visual implementation — 20 October 2026

The entry page now uses the approved globe/charcoal/violet composition.
`signin.html` renders the matching split account-access screen; credentials and
passkey actions are disabled until the identity backend is connected. The access
form has no active submission path and must not be presented as working login.
Registration/recovery links explain current availability without accepting data.

The ledger opens on Portfolio with the full sidebar, notification dialog,
selected-account Receive view and clipboard action, Assets with Balance/Value/
Status columns, and a separate Settings view for wallet network information.
`portfolio.js` plots only successful native-balance observations from the current
page session, scoped to the account/network. Two reads are needed for a chart.
Time filters select existing observations; no month/year values are synthesized.
Market pricing, fiat total and historical portfolio value remain unavailable.
No unsupported APEC supply, price, order, transaction count or Mainnet status is
loaded from the design mockup. Reload/disconnect/account/network changes clear
session history. Send and Buy/Sell have explicit unavailable states and do not
invoke wallet signing or transfer methods.

`ledger-theme.css` styles the three screens and existing public pages;
`assets/primebridge-earth.webp` is the optimized, locally hosted hero image.
No public account records or authentication credentials are introduced.
