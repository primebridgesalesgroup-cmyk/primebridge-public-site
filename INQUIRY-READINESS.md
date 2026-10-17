# Customer inquiry release record

Owner authorized merge and deployment on October 16, 2026, after accepting
responsibility for inbox monitoring and cleanup. The reviewed privacy notice is
in `privacy.html`; the inbox procedure remains in `INQUIRY-INBOX-PROCEDURE.md`.
No Gmail settings, automatic deletion, or reminders were configured by this task.

## Verified before release

- Web3Forms recipient: primebridgesalesgroup@gmail.com. Public form identifier
  only; no mailbox credentials or private validator infrastructure in the site.
- hCaptcha enabled and persisted after dashboard reload; spam filtering on.
- Retention dashboard persisted as three months. Owner's Gmail retention target
  is 90 days; Gmail copies require the separate owner-managed procedure.
- Protected synthetic test APLUS-TEST-20261016-HC1 was accepted by Web3Forms;
  the owner confirmed Gmail receipt. The browser cleared fields and blocked
  duplicate sends after acceptance.
- Browser-origin missing-token submission was rejected with "hCaptcha Token is
  mandatory for this form". CAPTCHA was not bypassed.
- Desktop/mobile local draft and mocked delivery suites passed. They exercise
  success, invalid input, CAPTCHA load failure, rejection, quota error, offline,
  transport failure, malformed/server responses, timeout and duplicate clicks.
- Provider acceptance is not presented as inbox receipt, a booking, a quote or
  project acceptance. Ambiguous outcomes retain details and block page-local
  resubmission. Server-side idempotency across reloads is not claimed.
- PR #29 contains PR #28's current head 6be8767. Verify current CI and merge state
  immediately before merging; release PR #28 first, then PR #29.

## Release configuration

`DELIVERY_ENABLED` is true for the authorized release. The disabled-state rollback
is covered by a local fixture. CAPTCHA loads only on customer request; no automatic
submission is performed. Payload fields are allowlisted and POSTed only to the
fixed Web3Forms HTTPS endpoint, without cookies or referrer. A 15-second timeout
and failure messages preserve customer details. Customer data is not saved in
browser storage or application logs by the frontend.

The privacy page and inquiry assets are explicitly staged by the Pages workflow.
Do not upload repository documentation, tests or private infrastructure artifacts.
The approved visual design, exchange preview and development disclosures remain.

## Deployment verification still required

1. Confirm final-head navigation/browser CI passes, merge dependencies in order,
   and record the resulting main SHA.
2. Wait for Pages deployment tied to that main SHA; investigate failures.
3. Verify live Services, privacy page, active inquiry panel, navigation, narrow
   layouts and absence of unexpected private API requests.
4. Verify the protected form on the production origin. Human CAPTCHA completion
   and inbox confirmation remain owner actions; localhost receipt alone does not
   establish production-origin delivery.
5. Free-plan quota is 250 per month, without paid domain restrictions. Monitor
   quota and spam. Real quota exhaustion was not tested.

Provider documentation:
- https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha
- https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript
