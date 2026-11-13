# Security review — NexaFlow demo frontend

Scope: everything in `src/`, `next.config.ts` and dependencies. The review covers the demo itself and states clearly what must change before handling real customer data.

## Demo boundaries (by design, not production-ready)

| Area | Demo behaviour | Production requirement |
| --- | --- | --- |
| Authentication | Real credential check against MongoDB (`users` collection, unique email index). Passwords stored as scrypt hashes with random salt; constant-time compare; generic errors; per-IP rate limit on sign-in/sign-up. The signed-in profile is then kept client-side (no server session cookie yet). | httpOnly server session cookie, 2FA, Redis rate limiting; remove the default-credentials panel from the sign-in page. |
| Route protection | Client-side redirect in `AppShell`. | `proxy.ts` cookie check for UX, **API enforcement on every request**. |
| Permissions | `useCan()` hides/disables controls only. | Same matrix enforced server-side with `@RequirePermission`. |
| Data storage | `localStorage` (per browser, unencrypted, readable by any script on the origin). | PostgreSQL with RLS; nothing sensitive in web storage. |
| Payments | Simulated. **No card or bank fields exist**; users choose fixed test methods. | Stripe Elements (iframe) + webhook-confirmed status. |

## Controls implemented

- **No secrets in the codebase.** The MongoDB URI lives only in git-ignored `.env.local`; `.env.example` has placeholders. The default admin password is intentionally displayed on the demo sign-in page and must be changed for real use.
- **Input validation** with Zod on every form (length limits, email format, numeric ranges, `https?://`-only website URLs, phone character whitelist, date ordering).
- **XSS:** no `dangerouslySetInnerHTML`, `innerHTML` or `eval`; all user content renders through React escaping. Customer websites open with `rel="noopener noreferrer nofollow"` and only `http(s)` schemes pass validation (blocks `javascript:` URLs).
- **Open redirect:** `?next=` on sign-in passes through `safeNext()` — only same-origin relative paths (rejects `//evil.com` and `/\evil.com`).
- **CSV / formula injection:** exports prefix cells starting with `= + - @ \t \r` with `'` (`downloadCsv`).
- **Account enumeration:** forgot-password always shows the same generic message.
- **Privilege escalation (UI):** only Super Admins can assign Super Admin or edit Company Admin permissions; Super Admin permissions are locked; users cannot remove themselves.
- **Tenant isolation (demo):** components only receive the active workspace's data via `useWorkspaceData()`; IDs from another workspace resolve to "not found". Verified by an automated test that switches workspaces.
- **HTTP headers** (`next.config.ts`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`; `X-Powered-By` disabled; `robots: noindex` for the demo.
- **Storage robustness:** every direct `localStorage` access is wrapped in try/catch (private mode, blocked storage).

## Findings and recommendations before production

| # | Severity | Finding | Recommendation |
| --- | --- | --- | --- |
| 1 | High (prod) | Demo state in `localStorage` | Remove `persist`; fetch from the API. Never keep tokens or PII in web storage. |
| 2 | High (prod) | Authorization is client-side only | Enforce RBAC + tenant guard in the API; add cross-tenant integration tests per endpoint. |
| 3 | Medium | No Content-Security-Policy yet | Add a nonce-based CSP via `proxy.ts` (`script-src 'self' 'nonce-…' https://js.stripe.com; frame-src https://js.stripe.com`). |
| 4 | Medium | No rate limiting (n/a in demo) | Redis-backed limits on auth, password reset, exports and payment-intent creation. |
| 5 | Low | Invoice totals computed in the browser | Recompute on the server from line items; store integer cents. |
| 6 | Low | Audit trail is a UI activity feed | Append-only `AuditLog` for role changes, exports, refunds, sign-ins. |
| 7 | Info | Dependency advisories | `next` upgraded from 16.1.1 to 16.4.6 (fixes critical advisories); `npm audit --omit=dev` reports 0 vulnerabilities. 8 moderate advisories remain in dev-only lint tooling (`minimatch` via ESLint plugins) and never ship to users. Keep Dependabot + `npm audit` in CI. |

## Verification performed

- `tsc --noEmit` (strict) — 0 errors
- `eslint .` (next/core-web-vitals + typescript + React Compiler rules) — 0 problems
- `next build` — all routes compile
- Automated browser checks (Chrome, desktop/tablet/mobile) across all routes: no console errors, no horizontal overflow; end-to-end flows for sign-in validation, customer CRUD + notes, Kanban move (menu + drag), invoice totals, simulated payment, workspace isolation, search, permission toggles, sign-out redirect.
