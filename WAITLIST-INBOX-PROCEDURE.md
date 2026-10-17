# A+ launch waitlist: production operating procedure

This list is **not** a blockchain account registry, token reservation, or exchange account. Subscriber data must not enter the ledger, public repository or validator infrastructure.

## Inbox capture and deduplication
1. Assign one owner to the business inbox. Check the subject `A+ launch waitlist — explicit opt-in` and the provider's accepted submission record.
2. Maintain a restricted-access subscriber register with email, optional name, role, provider receipt timestamp, consent wording/version, status, and unsubscribe timestamp. Normalize and deduplicate email addresses. Do not put subscriber data in GitHub, source code, a public spreadsheet, or the blockchain.
3. Do not send any marketing emails until the subscriber register and suppression list are operational. Web3Forms success proves only provider acceptance, **not inbox receipt**.
4. Restrict access to staff responsible for announcement sending. Back up the list and verify restoration; avoid unnecessary copies. Do not export data to a vendor without a reviewed privacy notice.

## Withdrawals
1. Review requests with subject `UNSUBSCRIBE A+` and replies that clearly withdraw consent before every campaign.
2. Immediately mark the email as suppressed; send no further launch announcements to it. Record the date and outcome. For deletion requests, remove subscriber details from the active register while retaining the minimum suppression record needed to prevent re-enrollment without renewed consent.
3. Remove the address from any external email-sending lists and assess requests for removal from provider copies; do not promise an instant provider-wide deletion.
4. Include an accessible, functioning unsubscribe method in **every** promotional message. The current manual email route must be monitored, tested and resourced or replaced by an automated, authenticated unsubscribe endpoint before scaling.

## Mandatory production acceptance
- [ ] Owner confirms Web3Forms access key maps to their approved business inbox and allowed site origin.
- [ ] With an authorized test address, complete a real hCaptcha challenge on the actual production domain; provider responds success and the owner confirms receipt and contents.
- [ ] Record one test subscriber in the restricted register, deduplicate a repeated request, withdraw consent, confirm suppression, and test a subsequent campaign exclusion.
- [ ] Ensure privacy notice, status copy, links, and mobile layout are correct in a real browser.
- [ ] Verify that only approved public files ship, no sensitive keys/addresses are leaked, and that all required CI checks pass.
- [ ] Only then authorize the production merge/deployment and separately inspect the deployed URL.

**Do not mark these acceptance checks complete based solely on mocked browser tests.**
