# Consultation and quote inquiry release gates

## Current behavior

The Services page prepares a local text draft only. It does not collect contact
details, send requests, store entries, open email, or contact private APIs.
Copying is an explicit device clipboard action. Edits invalidate the draft;
clearing resets the fields. JavaScript failure leaves the form disabled.
This is preparation tooling, not an activated lead-delivery service.

## Web3Forms integration prepared

The owner selected Web3Forms Free and primebridgesalesgroup@gmail.com. The
onboarding UI confirmed the form is ready and identifies its key as public.
The dashboard recipient matches the owner's address. No mailbox credential or
private infrastructure is used in the frontend.

`inquiry-delivery.js` contains a separate delivery flow with `DELIVERY_ENABLED`
set to `false`. Its contact panel is hidden and disabled, and no CAPTCHA script
or submission request loads in the shipped state. Tests exercise the enabled
flow by replacing the gate in a local-only fixture and intercepting all external
requests. Mock success proves handling, not real inbox delivery.

The prepared flow loads hCaptcha on customer request, requires a token and inquiry
acknowledgment, and sends only allowed fields to the fixed Web3Forms HTTPS endpoint.
It disables concurrent submission, omits cookies and referrer, has a 15-second
timeout, retains inputs on failures, and never displays raw provider messages.
Only an explicit successful provider response clears the fields. Acceptance is
not presented as inbox receipt, a booking, or a quote. Ambiguous responses lock
resending for that page load and direct the customer to check delivery first.
This guard does not provide server-side idempotency across reloads or devices.

Observed dashboard settings: CAPTCHA **hCaptcha** (saved setting verified after reload on October 16, 2026), advanced spam filtering **on**,
retention **3 months** (saved setting verified after reload on October 16, 2026), free plan **250 submissions/month**. Domain restriction
is paid. The public form identifier is not an authorization secret; server-side
CAPTCHA enforcement is essential before activation.

Before changing the release gate:

1. hCaptcha is enabled and persisted after reload. Protected synthetic test
   **APLUS-TEST-20261016-HC1** was accepted by the real provider; the owner confirmed
   Gmail receipt on October 16, 2026. The browser showed fields cleared and send
   disabled after acceptance. A separate browser-origin native form submission
   without a CAPTCHA token was rejected with **hCaptcha Token is mandatory for
   this form**. Earlier server-origin 403 was inconclusive and is superseded by
   this browser-origin rejection test. No CAPTCHA was bypassed.
2. The owner approved a 90-day retention target; the saved Web3Forms setting is
   labeled **3 months**. Confirm a separate Gmail deletion process and approve the
   final customer privacy notice. See `INQUIRY-PRIVACY-DRAFT.md`.
3. `privacy.html` now contains the complete prepared customer notice and the
   hidden delivery panel links to it with a retention summary. Owner review of
   the notice and acceptance of `INQUIRY-INBOX-PROCEDURE.md` remain pending. The
   guide proposes daily inbox checks and weekly review before day 83, with exact
   closed messages permanently removed by the 90-day target after owner review.
   It does not configure Gmail or authorize automated deletion.
4. Protected synthetic delivery and owner inbox confirmation passed as recorded
   above. Error and quota handling passed with mocks; exhausting the real free
   allowance was not tested. No automatic retry is performed because the provider
   does not supply documented idempotency for this flow.
5. Enable only on the reviewed draft branch for final browser verification; keep
   merge and deployment as separate release decisions.

Provider integration references:
- https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha
- https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript

## Owner setup needed before delivery

1. Choose a business-controlled inbox and confirm who monitors it. Verify access
   and recovery; do not publish an invented address or put mailbox credentials
   in this public repository.
2. Choose an HTTPS form intake service or separately reviewed private gateway.
   Verify domain ownership, spam controls, recipient verification, access controls,
   and delivery failure handling. Never put a provider secret in frontend code.
   Keep validator/RPC infrastructure separate from customer intake.
3. Approve a customer-facing privacy notice: operator/contact, requested fields,
   purpose, recipient/provider access, retention/deletion rules, and how customers
   ask about their data. Obtain the owner's actual decisions before publishing
   these terms; this checklist is not an approved privacy policy.
4. Collect only the necessary name, reply address, service, general location,
   and project summary. Separate inquiry acknowledgment from optional marketing
   consent. Do not request attachments, payments, credentials, or sensitive records
   for initial inquiries.
5. Verify server-side validation, request-size limits, rate limiting, spam
   protection, origin rules, and safe logging. A static public page alone cannot
   supply these protections. Browser validation is only a usability aid.
6. Add timeout, offline, rejection, retry, and duplicate-submit behavior. Display
   receipt only after the server confirms durable acceptance; do not equate an
   accepted request with email delivery or a booked/accepted project.

## Verification before customer launch

- Run desktop/mobile and keyboard checks, including no JavaScript, invalid data,
  clipboard denial, narrow widths, and edits after preparation.
- Use synthetic data for delivery tests. Confirm inbox receipt and failure alerts,
  spam handling, duplicate prevention, retention/deletion, and no sensitive logs.
- Confirm privacy copy and service claims with the business owner.
- Confirm PR #28 dependency and the exact reviewed commit. Check all CI results
  before any release decision. Keep PR #29 draft until launch gates are met.
- Do not merge or deploy as part of this development task.

## Local verification

`node tests/inquiry-browser.cjs` runs the inquiry checks with Playwright Chromium.
For an installed browser, set `TEST_BROWSER_PATH` to its executable. The existing
navigation and browser smoke workflows also run on pull requests. Publishing
includes the Services page, privacy notice and inquiry scripts in its explicit
public asset allowlist;
this change does not execute a deployment.

## Verified delivery evidence and limits

- Test origin: localhost-only copy of the reviewed frontend with delivery enabled
  locally; the public branch delivery flag remains false.
- Synthetic reference: APLUS-TEST-20261016-HC1. Provider accepted it; inbox receipt
  was confirmed directly by the owner, not independently read through Gmail.
- Missing-token negative test: browser-origin request rejected by provider with
  the mandatory hCaptcha token error; this is distinct from client validation.
- Production-domain delivery, final notice approval, business inbox deletion,
  PR #28 dependency reconciliation, and release review remain separate gates.
- No merge, deployment, private infrastructure access, or live customer rollout.
