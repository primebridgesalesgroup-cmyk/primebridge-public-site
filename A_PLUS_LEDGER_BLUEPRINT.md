# Prime Bridge / A+ Ledger — approved design and integration map

Owner-approved direction: 20 October 2026. This is the implementation reference
for the newest design, not a certificate that the complete application is live.
It supersedes the October 16 monochrome presentation brief for the next visual
release. Existing services and customer forms must be preserved during migration.

## 1. The customer journey

Public Prime Bridge website -> secure A+ customer sign-in -> personal A+ Ledger.
Wallet linking is a separate explicit permission inside the customer experience.
A wallet address alone does not grant access to private customer records. Public
Pages content is readable without sign-in; hiding a panel in JavaScript cannot
protect data. The current wallet workspace is public/read-only and must not be
represented as the completed authenticated ledger.

### Screen 01 — Website entry

- Prime Bridge / A+ identity; dark space/globe hero; restrained violet accents.
- Heading: “Your gateway to the A+ economy.”
- Navigation: Ledger, Blockchain, Exchange, Code Bank, Services, customer access.
- Final primary action: “Sign in to your ledger”; secondary: “Explore services”.
- Registration and developer participation have clear, distinct destinations.
- Private balances, customer profiles and wallet activity never appear here.
- Until real A+ authentication is connected, use the truthful “Customer access”
  entry rather than a credential form that cannot authenticate.

### Screen 02 — Secure customer access

- Email/password sign-in, registration and recovery; passkeys when configured.
- Customer account/session, recovery, device sign-out and ownership verification
  belong to a deployed HTTPS identity service, not static browser storage.
- “Your wallet stays yours”: never request a recovery phrase/private key.
- Customer sign-in and wallet permission must not impersonate one another.
- One-World remains a separate application/account. Its sign-in link is not A+
  single sign-on. An explicit shared-identity integration would be required.
- No social sign-in providers are selected or claimed as connected.

### Screen 03 — Personal customer ledger

Dark application shell, fixed sidebar, compact account header, restrained violet
selection/chart accents, large portfolio metric, asset table, status footer and
responsive mobile navigation. The image's balance, price change, token quantities,
transaction counts and network height are illustrative and must never be shipped
as production customer data.

| Section | Customer purpose | Required data/action |
| --- | --- | --- |
| Portfolio | Total valued holdings, performance and timeframe filters | Owner-scoped holdings; trusted quotes; valuation timestamp/currency; actual historical snapshots |
| Accounts | Customer account and linked wallets | Verified account/session; challenge-based wallet ownership linking; revocation |
| Assets | Search/filter holdings by category | Asset, Category, Balance, Value, Status; valuation unavailable stays blank/dash |
| Send | Review and approve supported transfers | Correct network/token/recipient, exact amount, gas/fees, wallet confirmation and receipt |
| Receive | Display the customer's own supported address/network | Verified selected account, copy/QR, clear asset/network compatibility |
| Buy / Sell | Eligible purchases and sale progress | Provider/catalog authorization, pricing, capture/refund, accounting |
| Exchange | Listings, orders, progress and receipts | Approved real inventory/rights, matching/reservations, settlement/reconciliation |
| Code Bank | Developer listings, licenses and earnings | Release provenance/terms, approved listings, lease/expiry/download authorization, payouts |
| Activity | Payments, transfers, licenses and fees | Owner-scoped immutable records, pagination and reconciliation |
| Blockchain | News, updates, milestones, roadmap and maintenance notices | Public approved announcements; customer benefits; availability status |
| Security | Passkeys, sessions, permissions and activity | Identity-backed security events and revocation; wallet permission boundaries |
| Settings | Profile, preferences and notifications | Authenticated owner-scoped settings; support and optional network details |

Categories: Currency/Tokens, Energy records, Software/Code licenses, API access,
Physical assets/Inventory, Other digital rights. Classification is not proof of
ownership, market value or transferability. Unpriced assets must not be summed
into a fictional portfolio value.

## 2. Live-site review at the recorded baseline

Reviewed public commit `0d6dc4a3d72a56e01b03f1543e45096aa302a0d9`.
The homepage, dashboard, Blockchain, Services, Milestones, waitlist, both privacy
pages, sandbox checkout and archived exchange preview all returned HTTP 200.
The latest Pages deployment, browser checks and navigation checks succeeded.
No customer form was submitted and no wallet transaction was sent in this review.

| Existing route/source | Observed condition | Use in approved design |
| --- | --- | --- |
| `index.html` | Simplified public workspace/service entry, monochrome; no approved globe/purple composition yet | Retain business identity, service/participation links and accessible navigation; implement Screen 01 in visual release |
| `dashboard.html` / `dashboard.js` | Public wallet reads; assets/categories/search/CSV; eight sections | Reuse wallet/read logic and asset controls behind the new application composition; this is not an auth wall |
| `workspace.css` | Responsive monochrome shell and homepage styles | Preserve responsive behavior; evolve application/entry styling to approved image |
| A+ sign-in/register/recovery pages | Not present | Screen 02 and authenticated backend must be implemented together |
| Portfolio/history/Send/Receive/Settings | Not implemented as complete customer flows | Screen 03 work; do not fill gaps with example data or nonfunctional controls |
| `blockchain.html` | Previously technical architecture explanation | Customer announcements/roadmap hub; no source code or validator diagnostic walkthroughs |
| `services.html` / inquiry scripts | Working inquiry UI with consent, CAPTCHA and delivery handling | Keep service contact and quote workflow intact |
| `waitlist.html` / `waitlist.js` | Explicit opt-in launch/developer interest; not account registration | Keep as participation interest, not customer/developer account activation |
| `milestones.html` | Historical public releases; previously omitted new wallet workspace | Keep dated release archive; current customer updates belong on Blockchain |
| `privacy.html` / `waitlist-privacy.html` | Existing inquiry and waitlist notices | Preserve; add actual account/wallet/transaction processing disclosures with those services |
| `preview/` | Clearly marked demonstration with fictional assets | Retain as historical reference; exclude from primary product navigation and imports |
| `sandbox.html` | Explicit Stripe test links | Keep separate from customer sign-in, real checkout and commercial pricing |
| One-World outbound link | Separate deployed application/account | Keep separate; never present as A+ account sign-in |

### Inconsistencies addressed by this organization release

- Shared public navigation now has the same product destinations on every page.
  Older primary links no longer send customers to the demonstration exchange.
- Blockchain is customer-facing updates and roadmap; wallet network read details
  move into Security. Underlying wallet read IDs and behavior are preserved.
- The waitlist no longer asserts an operational network from historical local
  verification. Its purpose remains explicit customer/developer interest.
- The README now describes the actual wallet-enabled workspace and current gaps.
- Historical redesign notes remain preserved and clearly marked historical.
- New visual layout, identity selection and private service deployment are not
  falsely marked complete by this content/navigation organization release.

## 3. Source ownership and integration boundaries

Public source: `primebridgesalesgroup-cmyk/primebridge-public-site`.
Private services: `primebridgesalesgroup-cmyk/PRIME-BRIDGE-SALES-GROUP-CORP`.
One-World: `fazzinitrapgod/One-World` (separate service and identity).
Continue in these repositories; do not create a duplicate application/repository
or migrate frameworks solely because the screenshot was described with React.

| Boundary | Existing implementation | Remaining evidence or work |
| --- | --- | --- |
| Public entry/navigation/forms | Public static website | Apply approved visual composition without losing existing forms/privacy/mobile access |
| Customer identity | Private signed-token verification adapter; One-World has separate auth code | Select/verify A+ identity runtime, owner-scoped sessions, registration/recovery/passkeys and protected records |
| Browser-wallet reads | Public EIP-6963/EIP-1193 wallet permission and read-only methods | Retain; add authenticated wallet linking separately before linking private records |
| Private inventory/evidence | Private A+ inventory, rights/ownership and evidence modules | Deploy authenticated API and supply owner-scoped customer listing/category endpoints |
| Software/API licenses | Private code-provenance, entitlements, usage metering; PR184 open | Deploy/verify code-bank API and contracts, license/access flows and developer account/payout integration |
| Stripe | Test fixtures; PR183 open; current private factory requires test keys | Correct account, production service/prices, signed webhook delivery, refunds and reconciliation |
| Blockchain transactions | Private receipt verification and local node tools | Reach existing node; verify actual chain/genesis/contract identity, consensus, receipts and finality |
| Portfolio value/history | No connected pricing/history service in public workspace | Trusted price sources; supported asset coverage; durable customer snapshots and historic data |
| Ledger activity | Private order/payment/chain reconciliation modules | Protected paginated customer activity read model; no invented transaction counts |
| Customer announcements | Public Blockchain page | Publish only confirmed releases/events and explicit roadmap availability |

As of this review PR183 (billing) and PR184 (code bank) are open, not merged or
verified deployed. No Desktop Commander device was connected at the last node
access check; the current public website is not evidence of validator access.
Chain IDs, genesis, treasury and deployed contracts must come from the existing
network/runtime; do not select a new production chain or replace genesis based
on local development examples.

## 4. Ordered implementation and completion evidence

1. Complete this source/content/navigation organization and retain the working
   inquiry/waitlist workflows. Use this document as the agreed design reference.
2. Establish the HTTPS application runtime and A+ account boundary. Confirm
   session ownership, registration, sign-out, recovery and passkey configuration.
3. Implement the three approved screens using existing source where applicable;
   compose separate account, wallet, portfolio, assets and activity components.
4. Integrate private customer records and verified wallet linking. Reject other
   customers' record requests at the server, including direct endpoint calls.
5. Connect valuation/history, code licenses, billing and transaction services in
   coherent customer flows; preserve fee, gas, earnings and settlement distinctions.
6. Confirm the actual blockchain transaction path and expose customer-appropriate
   status. Publish plain-language releases and upcoming changes on Blockchain.
7. Verify mobile/desktop, keyboard/accessibility, permission/cancellation/errors,
   account separation, real service receipts, backups, rollback and monitoring.
8. Record deployed commit, routes, service owners, successful/denied requests and
   operational receipts. A screenshot, hidden section or green static build alone
   cannot establish that customer funds/private data are operationally connected.

## 5. Customer content policy

Blockchain is the customer news hub. Each announcement needs a date when known,
a clear headline, customer impact, an honest Available now / Coming next / Planned
label, and a useful destination. Publish maintenance windows only when confirmed.
Do not expose source files, PR/test counts, private RPCs, secrets or implementation
walkthroughs in customer product pages. Technical implementation belongs here and
in private service documentation. Do not promise dates, prices, returns, backing,
network synchronization or features without supporting evidence.
