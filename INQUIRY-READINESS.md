# Consultation and quote inquiry release gates

## Current behavior

The Services page prepares a local text draft only. It does not collect contact
details, send requests, store entries, open email, or contact private APIs.
Copying is an explicit device clipboard action. Edits invalidate the draft;
clearing resets the fields. JavaScript failure leaves the form disabled.
This is preparation tooling, not an activated lead-delivery service.

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
includes `services.html` and `inquiry.js` in its explicit public asset allowlist;
this change does not execute a deployment.
