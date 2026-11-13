/**
 * Default Super Admin shown on the sign-in page of this demo build.
 * Created in MongoDB by `npm run db:seed` (scripts/seed-admin.mjs keeps the same defaults).
 * Change the password (or set ADMIN_PASSWORD before seeding) for any real deployment,
 * and remove this panel from the sign-in page.
 */
export const DEFAULT_ADMIN = {
  email: "admin@nexaflow.com",
  password: "NexaFlow@2026",
} as const;
