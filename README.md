# Prime Bridge public website

The public release contains current business-service information, protected inquiries, launch registration, customer announcements and privacy notices. Customer ledger, sign-in, exchange, Code Bank and payment demonstrations are retained in source and excluded from production.

## Build and publish

Run `python3 scripts/build-public.py` and deploy only `_public/`. The publish workflow uploads this explicit allowlist. `_config.yml` protects the same boundary for legacy GitHub Pages builds. Do not add `.nojekyll` at the repository root; the builder creates it inside the artifact.

The exact release is verified by `tests/public-release.cjs`, alongside the existing form/browser checks. Public pages never contain the test payment links or fictional marketplace data kept in source. Unknown and retired URLs return the custom 404 page.

## Readiness and application source

See [LIVE-READINESS.md](LIVE-READINESS.md) for findings, corrections and the backend work required before customer application release. The approved interface remains documented in [A_PLUS_LEDGER_BLUEPRINT.md](A_PLUS_LEDGER_BLUEPRINT.md). Its implementation remains in `dashboard.html`, `dashboard.js`, `portfolio.js`, `signin.html` and `access.js`; publishing those files is a separate release decision once the complete customer journey works.

Private application code belongs in `primebridgesalesgroup-cmyk/PRIME-BRIDGE-SALES-GROUP-CORP`. No private source, keys, environment files or validator material should be copied into this repository or the public artifact.

## Contact workflows

The service inquiry and launch-registration forms use Web3Forms and opt-in hCaptcha. Form identifiers in browser source are public identifiers. Mailbox credentials never belong in client code. Inbox operation procedures and privacy notices remain in their existing documents.
